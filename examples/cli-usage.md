# CLI Usage

Generate HTML:

```bash
echarts-chartpage generate \
  --input examples/inputs/line-chart.json \
  --output examples/generated/line-chart.html
```

Recommend a chart type:

```bash
echarts-chartpage recommend --input examples/inputs/bar-chart.json
```

Validate input and HTML:

```bash
echarts-chartpage validate \
  --input examples/inputs/pie-chart.json \
  --html examples/generated/pie-chart.html
```

Patch an existing config:

```bash
echarts-chartpage patch \
  --base examples/inputs/patch-base.json \
  --patch examples/inputs/patch-update.json \
  --output examples/generated/patch-example.html
```
