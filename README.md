# The AI Knowledge Chasm: Evidence-Based Analysis

An interactive visualization based on empirical research (2024-2025) showing how AI is creating compound acceleration effects in human inequality, with the top 10% capturing 70% of AI productivity gains.

## Live Demo

[View the interactive model](https://knowledge-divergence-model.vercel.app)

## Key Research Findings (2024-2025)

- **60% Job Impact**: AI affects 60% of jobs in advanced economies, not the 40% commonly cited (IMF 2024)
- **70% Capture Rate**: Top 10% of earners capture 70% of AI-generated productivity gains
- **8.7x Investment Gap**: US has 8.7x more AI investment than China, creating massive concentration
- **Network Effects**: AI adoption creates "AI deserts" where recovery becomes exponentially harder
- **No Easy Solutions**: Traditional interventions appear insufficient to counter accelerating forces

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