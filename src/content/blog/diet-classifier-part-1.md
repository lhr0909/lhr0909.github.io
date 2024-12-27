---
title: Building Rasa's DIET Classifier from Scratch using PyTorch - Part 1
pubDate: 2022-08-23
tags:
  - chatbot
---


I love using [Rasa](https://rasa.com), a Python chatbot framework that is powerful and modular, and at the same time, it just works out of the box without much tinkering. Everything about this framework is great. I have spent the past 3 years using the framework since its v0.10 release and now it is at v3.

After using it for a few years, I have found a few things I like and keep coming back to the framework for:

1. Rasa’s modular NLU pipeline is super powerful, especially the DIET (Dual Intent-Entity Transformer) Classifier. I didn’t know at first, but you can actually control how the model is configured before the training, and you can make the model either as lightweight as you can (to fit in embedded devices like a Raspberry Pi), or as powerful as you need (by leveraging large pre-trained language models, adding transformer layers etc). Rasa also allows us to add custom components in the NLU pipeline so we can combine the best in the industry (like Facebook’s duckling project, and Microsoft’s Recognizers-Text project).
2. The configuration is straightforward. All we need to do is to fill in a few YAML files for training data and configuration, and Rasa will just work. In fact the default configuration usually gets us very far, even in production.
3. When it deploys, it becomes an HTTP service, so it is easy to integrate. They also provide an API for us to add custom action webhooks. We created a [TypeScript Rasa SDK](https://github.com/botisan-ai/rasa-action-server) to we can interact with Rasa with the programming language we feel most comfortable with.

I have also found a few things that we didn’t like about the framework:

1. The startup time is a bit slow, since there are a lot of knobs inside the framework that it needs to dial on/off at startup.
2. The overall package is a bit large, and not easy to break apart. We wanted to set up a flexible NLU service that is preferably serverless, and having large Python dependencies does not allow us to do so.
3. We didn’t have to use TEDPolicy that much in our chatbot projects with clients, and a lot of our chatbots are still slot-filling-based and it is easier if we rely on forms. If we were to do that, then Rasa Core becomes a bit too bloated to use, and it is easier if we make Rasa do just one thing and one thing well - converting text into intent and entity labels (a.k.a NLU).

For a while I was afraid of the framework, since I don’t have a lot of experience building ML models, the Rasa codebase has always been daunting to me. But after going through the DIET architecture explanation videos and read the specific source code around the Tensorflow Keras Layers and DIET Classifier definitions, I decide to try to move the DIET Classifier to PyTorch, as my deep learning study project.

By moving the model into PyTorch, it also allows for our team to ship the model directly with our [NodeJS chatbot codebase](https://github.com/botisan-ai/xstate-chatbot) using ONNX runtime. It is going to help us build out lighter chatbots for clients.

If we look at the [architecture blocks](http://bl.ocks.org/koaning/raw/f40ca790612a03067caca2bde81e7aaf/), we found that the DIET Classifier is rather complex with a lot of layers. However, there are a lot of components we can strip out, if we just want a dead simple intent classifier. We just need to run through the sentence feature and the intent label feature through an embedding layer, and calculate the similarity between them. This way we got ourselves the simplest DIET Classifier architecture - the “I” (stands for “intent”) Classifier.

Since Rasa’s DIET Classifier is already filled with all sorts of configurations and code branches, it is hard to identify just the layers we need. Thankfully the architecture blocks diagram is interactive with configuration information, so I can search these configuration variables to track down the model layers.

After grokking around the Rasa codebase, I found the embedding layer and the loss function used by Rasa. The embedding layer is a simple Keras Dense layer to help change the input dimensions. This fully-connected layer will just get directly translated to a Linear module in PyTorch. For the similarity calculation, it is using a dot product, so if we have a sentence embedding, we want to calculate the dot product against all of the available intent labels, getting similarity scores between the sentence and all the intents.

```python
# The simplest intent classifier in DIET architecture
import torch
from torch import nn, Tensor

from .config import DIETClassifierConfig

class IntentClassifier(nn.Module):
    def __init__(self, config: DIETClassifierConfig):
        super().__init__()
        # Rasa's embedding layer is actually a "dense embedding layer" which is just a Keras dense layer
        # equivalent to a PyTorch Linear layer.
        self.sentence_embed = nn.Linear(config.sentence_feature_dimension, config.embedding_dimension)
        self.label_embed = nn.Linear(config.num_intents, config.embedding_dimension)

    def forward(self, sentence_features: Tensor, label_features: Tensor):
        sentence_embedding = self.sentence_embed(sentence_features)
        label_embedding = self.label_embed(label_features)

        # dot product similarities
        similarities = torch.mm(sentence_embedding, label_embedding.t())

        return similarities
```

This concludes the intent classification model. Now to train it we need to define a loss function. Since we are trying to identify a single intent from a sentence, it is best if we use cross-entropy loss. I put together a PyTorch Lightning Module for the classifier and I can define the training step directly in the module.

```python
# DIET Classifier PyTorch Lightning Module that uses cross-entropy loss in the training step
import torch
from torch import optim, nn, Tensor
import torch.nn.functional as F
import pytorch_lightning as pl

from .config import DIETClassifierConfig
from .models import IntentClassifier

class DIETClassifier(pl.LightningModule):
    def __init__(self, config: DIETClassifierConfig):
        super().__init__()
        self.config = config
        self.intent_classifier = IntentClassifier(config)

    def forward(self, sentence_features: Tensor):
        label_features = torch.eye(self.config.num_intents)
        return self.intent_classifier(sentence_features, label_features)

    def configure_optimizers(self):
        optimizer = optim.Adam(self.parameters(), lr=1e-3)
        return optimizer

    def training_step(self, batch, batch_idx):
        sentence_features, target = batch
        similarities = self.forward(sentence_features)
        loss = F.cross_entropy(similarities, target)
        self.log('train_loss', loss)
        return loss
```

Before we are able to train, we need to provide a dataset to the trainer. I created a LightningDataModule, and I needed to read in the NLU training sentences (using a YAML file very similar to Rasa’s NLU training data format), turn them into feature vectors using a pre-trained model, and then run through the model. I am a big fan of PolyAI’s ConveRT model for English conversations, and in order to use it in both training time and make the NLU pipeline composable in inference time, I set up [an executor using Jina](https://github.com/botisan-ai/convert-featurizer). It provides a “DocArray in, DocArray out” executor contract, making it easy to combine executors together in a single request. I can easily isolate all the Tensorflow Hub dependencies from ConveRT in a Docker container, and reference it using a Jina client.

```python
# ConveRT Featurizer Jina Executor
from conversational_sentence_encoder.vectorizers import SentenceEncoder
from jina import Executor, requests
from docarray import DocumentArray

class ConveRTFeaturizer(Executor):
    def __init__(self, multiple_contexts=False, **kwargs):
        super(ConveRTFeaturizer, self).__init__(**kwargs)
        self.sentence_encoder = SentenceEncoder(multiple_contexts=multiple_contexts)

    @requests
    def featurize(self, docs: DocumentArray, **kwargs) -> DocumentArray:
        docs.embeddings = self.sentence_encoder.encode_sentences(docs.texts)
        return docs
```

```python
# PyTorch Lightning Data Module for ingesting NLU training data YAML file
from typing import Dict, Any, List
from pathlib import Path
import yaml
import torch
import pytorch_lightning as pl
from torch.utils.data import DataLoader
from jina import Flow
from docarray import DocumentArray, Document

class DIETClassifierDataModule(pl.LightningDataModule):
    def __init__(self, convert_featurizer_host: str = 'jinahub+docker://ConveRTFeaturizer/latest', filename: str = 'nlu.yml', batch_size: int = 32) -> None:
        super().__init__()
        self.flow = Flow().add(uses=convert_featurizer_host)
        self.filename = filename
        self.batch_size = batch_size
        self.read_nlu_file()

    def read_nlu_file(self):
        nlu_file = open(Path(self.filename).resolve(), 'r')
        nlu: Dict[str, Any] = yaml.load(nlu_file, Loader=yaml.Loader)
        self.nlu_intents: List[Dict[str, Any]] = nlu.get('nlu', [])
        self.num_intents = len(self.nlu_intents)
        self.label_data = torch.eye(len(self.nlu_intents))

    def prepare_data(self):
        self.read_nlu_file()
        # one hot encoding for labels
        self.intent_dataset = []
        with self.flow:
            for i, intent in enumerate(self.nlu_intents):
                examples: List[str] = intent.get('examples', [])
                example_da = DocumentArray([Document(text=sentence) for sentence in examples])
                features_da: DocumentArray = self.flow.post('/', inputs=example_da, show_progress=True)
                for feature in features_da:
                    self.intent_dataset.append((torch.from_numpy(feature.embedding), torch.tensor(i)))

    def train_dataloader(self):
        return DataLoader(self.intent_dataset, batch_size=self.batch_size, shuffle=True)

if __name__ == '__main__':
    data_module = DIETClassifierDataModule()
    data_module.prepare_data()
```

```yaml
# NLU training file
nlu:
  - intent: greet
    examples:
      - Hello
      - Hi
      - Hey
  - intent: affirm
    examples:
      - "Yes"
      - "Yes, that's right"
  - intent: deny
    examples:
      - "No"
      - "No, that's wrong"
```

Training is very fast using PyTorch. I have an equivalent configuration in Rasa (turned off transformer layers, entity recognition and masking), and the training time is a bit slower. But I wasn’t sure if I am building the correct model, and whether or not the model would do its job - classify intents. I quickly put together an inference executor for running the trained classifier model in Jina, and set up a flow to test it.

```python
# Combined NLU Pipeline and inference test using Jina Flow
from typing import Any, Dict, List
import yaml
from pathlib import Path
from jina import Executor, requests
from docarray import DocumentArray, Document
from docarray.score import NamedScore
import torch
import torch.nn.functional as F

from diet_classifier.config import DIETClassifierConfig
from diet_classifier.classifier import DIETClassifier

class DIETClassifierExecutor(Executor):
    def __init__(self, nlu_filename='nlu.yml', model_path='./lightning_logs', **kwargs):
        super().__init__(**kwargs)
        self.nlu_filename = nlu_filename
        self.read_nlu_file()
        config = DIETClassifierConfig(num_intents=self.num_intents)
        self.model = DIETClassifier.load_from_checkpoint(Path(model_path).resolve(), config=config)

    def read_nlu_file(self):
        nlu_file = open(Path(self.nlu_filename).resolve(), 'r')
        nlu: Dict[str, Any] = yaml.load(nlu_file, Loader=yaml.Loader)
        self.nlu_intents: List[Dict[str, Any]] = nlu.get('nlu', [])
        self.num_intents = len(self.nlu_intents)

    @requests
    def request(self, docs: DocumentArray, **kwargs) -> DocumentArray:
        similarities = F.softmax(self.model(torch.tensor(docs.embeddings)))
        for i, doc in enumerate(docs):
            doc.embedding = similarities[i].detach().numpy()
            for j in range(self.num_intents):
                score = similarities[i].detach().numpy()[j]
                intent = Document(text=self.nlu_intents[j]['intent'], modality='intent')
                intent.scores['confidence'] = NamedScore(value=score, description='confidence')
                doc.matches.append(intent)
        return docs
```

```python
# Combined NLU Pipeline and inference test using Jina Flow
from jina import Flow
from docarray import DocumentArray, Document

from executor import DIETClassifierExecutor

f = Flow().add(
    uses='jinahub+docker://ConveRTFeaturizer/latest'
).add(
    uses=DIETClassifierExecutor, uses_with={ 'model_path': './lightning_logs/version_4/checkpoints/epoch=999-step=1000.ckpt' }
)

with f:
    inputs = DocumentArray([Document(text='Naw man')])
    outputs: DocumentArray = f.post('/', inputs)
    for doc in outputs:
        doc.summary()
```

```python
# NLU Results

📄 Document: 390ade4aa6f98236224082851331c670
╭───────────┬──────────────────────────────────────────────────────────────────╮
│ Attribute │ Value                                                            │
├───────────┼──────────────────────────────────────────────────────────────────┤
│ text      │ Naw man                                                          │
│ embedding │ ▄▄▄                                                              │
╰───────────┴──────────────────────────────────────────────────────────────────╯
└── 🔶 Matches
    ├── 📄 Document: 626c8c7ed40279b4152aae627223e253
    │   ╭───────────┬──────────────────────────────────────────────────────────────────╮
    │   │ Attribute │ Value                                                            │
    │   ├───────────┼──────────────────────────────────────────────────────────────────┤
    │   │ adjacency │ 1                                                                │
    │   │ text      │ greet                                                            │
    │   │ modality  │ intent                                                           │
    │   │ scores    │ defaultdict(<class 'docarray.score.NamedScore'>, {'confidence':  │
    │   │           │ {'value': 0.005198138765990734, 'description': 'confidence'}})   │
    │   ╰───────────┴──────────────────────────────────────────────────────────────────╯
    ├── 📄 Document: 24407664d2bc641c5c3e57a88dc10145
    │   ╭───────────┬──────────────────────────────────────────────────────────────────╮
    │   │ Attribute │ Value                                                            │
    │   ├───────────┼──────────────────────────────────────────────────────────────────┤
    │   │ adjacency │ 1                                                                │
    │   │ text      │ affirm                                                           │
    │   │ modality  │ intent                                                           │
    │   │ scores    │ defaultdict(<class 'docarray.score.NamedScore'>, {'confidence':  │
    │   │           │ {'value': 0.0012212592409923673, 'description': 'confidence'}})  │
    │   ╰───────────┴──────────────────────────────────────────────────────────────────╯
    └── 📄 Document: 48b6fb8f0dc6cec248c8b5cba0d17cd2
        ╭───────────┬──────────────────────────────────────────────────────────────────╮
        │ Attribute │ Value                                                            │
        ├───────────┼──────────────────────────────────────────────────────────────────┤
        │ adjacency │ 1                                                                │
        │ text      │ deny                                                             │
        │ modality  │ intent                                                           │
        │ scores    │ defaultdict(<class 'docarray.score.NamedScore'>, {'confidence':  │
        │           │ {'value': 0.9935805797576904, 'description': 'confidence'}})     │
        ╰───────────┴──────────────────────────────────────────────────────────────────╯
```

And voila! I was able to get pretty much the same result as the equivalent Rasa trained model! I checked the model checkpoints vs Rasa’s packaged model files, and mine is only a few hundred kilobytes vs Rasa’s 1.6MB in a tar archive. Obviously the comparison is unfair, but I can already start picturing that we could use a much lighter-weight model and directly ship alongside of the browser. Imagine that we replace ConveRT featurizer with GPT-3 embeddings, and we can have a full JavaScript-based smart AI chatbot ready to go!

Interestingly enough, there are actually a few DIET Classifier PyTorch implementations out there on GitHub, and after implementing it myself, I can safely say that these existing implementations are all valid, just that they are much slimmed down than Rasa’s own implementations.

I am glad to share my learning journey with you, and it doesn’t stop here! That’s why I have put a “Part 1” in the title. I plan on adding most of the other components from the DIET architecture into the model, and making mine composable as well. This will help me learn a lot about how to set up deep learning models myself, and hopefully I am able to get to a full DIET implementation soon! But for now, the intent classifier is ready to go!

[GitHub](https://github.com/botisan-ai/diet-classifier-pytorch)