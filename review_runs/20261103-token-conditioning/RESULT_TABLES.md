| Method | Mean distance ↓ | 95% interval |
| :--- | ---: | :--- |
| Random | 26.888 | 26.137–27.679 |
| Constant mean | 19.046 | 18.566–19.531 |
| Direct TF-IDF | 21.609 | 20.971–22.251 |
| Token graph | 21.706 | 21.040–22.321 |
| Linear generation | 17.707 | 17.215–18.177 |
| Neural generation | 17.688 | 17.214–18.158 |
| Neural retrieval | 22.182 | 21.590–22.798 |

| Method | Raw passing pairs | Foreground gate | Background fallback | Additional background changes |
| :--- | ---: | ---: | ---: | ---: |
| Random | 339/1000 | 950/1000 | 1000/1000 | 28/200 |
| Constant mean | 300/1000 | 1000/1000 | 1000/1000 | 0/200 |
| Direct TF-IDF | 317/1000 | 958/1000 | 1000/1000 | 27/200 |
| Token graph | 310/1000 | 967/1000 | 1000/1000 | 23/200 |
| Linear generation | 277/1000 | 976/1000 | 1000/1000 | 15/200 |
| Neural generation | 272/1000 | 964/1000 | 1000/1000 | 21/200 |
| Neural retrieval | 382/1000 | 952/1000 | 1000/1000 | 31/200 |
