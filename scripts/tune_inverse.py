"""Validation-only alpha selection for the provisional inverse linear encoder."""
from pathlib import Path
import json
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from research.token_conditioning.model import load_clean_splits, palette_features
root=Path(__file__).resolve().parents[1]
b=joblib.load(root/'review_runs/20261103-token-conditioning/experiment-01/models/research_bundle.joblib')
splits,_=load_clean_splits(root/'review_runs/20261103-token-conditioning/datasets')
x=StandardScaler().fit(b['train_features'])
train=x.transform(b['train_features'])
rows=[]
for split in ('val','test'):
 q=b['space'].transform([r['text'] for r in splits[split]])
 target=b['space'].svd.transform(q)
 norm=np.linalg.norm(target,axis=1)
 covered=norm>0
 target/=np.maximum(norm[:,None],1e-15)
 features=x.transform(palette_features([r['palette'] for r in splits[split]]))
 for alpha in (.1,1,10,100,1000,10000):
  model=Ridge(alpha=alpha).fit(train,b['space'].embeddings)
  pred=model.predict(features)
  pred/=np.maximum(np.linalg.norm(pred,axis=1,keepdims=True),1e-15)
  rows.append({'split':split,'alpha':alpha,'cosine':float(np.einsum('ij,ij->i',target,pred)[covered].mean())})
selected=max((r for r in rows if r['split']=='val'),key=lambda r:r['cosine'])['alpha']
result={'selected_alpha':selected,'selection_metric':'mean cosine to held-out description SVD; validation only','results':rows}
(root/'review_runs/20261103-local-alpha/inverse-selection.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
