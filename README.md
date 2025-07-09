# Knowledge-Class Divergence in the AI Era

An interactive visualization demonstrating how knowledge gaps between elite and mass populations are accelerating in the age of AI, even as the unit price of knowledge approaches zero.

## Live Demo

[View the interactive model](https://knowledge-divergence-model.vercel.app)

## Key Findings

- **Knowledge Gap Acceleration**: The elite-mass knowledge ratio is projected to more than double from 2025 to 2030
- **Cognitive Limits**: Elite learning jerk approaches but stays within human adaptability ceiling (0.4 stock/yr³)
- **Policy Effectiveness**: STEM boot camps show 41% gap reduction potential vs only 9% for compute vouchers
- **Zero Price Paradox**: Even as AI makes knowledge virtually free, inequality accelerates due to differences in learning velocity, acceleration, and cognitive adaptation

## Model Components

### 1. Frontier AI Progress
Logistic growth function fitted to LLM cost-per-token decline data (2022-2025)

### 2. Two-Group Knowledge Dynamics
- **Learning Rate Multiplier**: Elite (40%) vs Mass (5%) adult learning participation
- **Present Bias**: β=0.93 (elite) vs 0.78 (mass) quasi-hyperbolic discount factors
- **Cognitive Saturation**: Working memory constraints limit knowledge absorption
- **Complementarity**: Knowledge compounds faster for elites (φ=1.30 vs 1.05)

### 3. Empirical Validation
Model validated against:
- STEM wage premium data (BLS)
- Adult learning participation gaps (OECD)
- PISA socioeconomic achievement gaps
- AI exposure wage effects (NBER)

## Interactive Features

- **Overview**: Real-time metrics and knowledge stock evolution
- **Gap Dynamics**: Explore velocity, acceleration, and jerk of learning
- **Parameters**: Adjust model parameters and see sensitivity analysis
- **Validation**: Compare model predictions to empirical data
- **Policy Interventions**: Simulate effects of boot camps, AI tutors, and compute vouchers
- **Mathematical Model**: Full equations with LaTeX rendering

## Technical Details

Built with:
- Plotly.js for interactive visualizations
- MathJax for mathematical equation rendering
- Pure HTML/CSS/JavaScript (no build process required)

## Local Development

```bash
# Clone the repository
git clone https://github.com/cryptojym/knowledge-divergence-model.git

# Navigate to project directory
cd knowledge-divergence-model

# Start a local server
python -m http.server 8000
# or
npx http-server

# Open http://localhost:8000 in your browser
```

## Citations

Key data sources:
- Epoch AI: LLM inference price trends
- OECD: Adult learning participation data
- BLS: STEM wage premium statistics
- NBER: AI exposure and skill premium research

## License

MIT License - feel free to use and adapt for research or educational purposes.