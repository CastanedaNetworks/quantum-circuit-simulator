# Quantum Circuit Simulator

A modern, interactive quantum circuit simulator built with React, TypeScript, and Three.js. Design, visualize, and simulate quantum circuits with an intuitive drag-and-drop interface.

![Quantum Circuit Simulator](https://img.shields.io/badge/quantum-simulator-blue)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue)
![Vite](https://img.shields.io/badge/vite-5.1.6-purple)

## 🚀 Features

### Circuit Design
- **Drag & Drop Interface**: Intuitive gate placement with visual feedback
- **Real-time Simulation**: Automatic circuit execution as gates are placed
- **3D Visualization**: Interactive 3D circuit representation
- **Gate Library**: Comprehensive collection of quantum gates (Hadamard, Pauli-X/Y/Z, CNOT, and more)

### Quantum Algorithms
- **Algorithm Templates**: Pre-built implementations of famous quantum algorithms
- **Step-by-Step Execution**: Educational mode with detailed explanations
- **Supported Algorithms**:
  - Bell State Preparation
  - Quantum Teleportation
  - Grover's Search Algorithm
  - Quantum Fourier Transform

### Visualization
- **Bloch Sphere**: Real-time quantum state visualization
- **Enhanced Gate Palette**: Interactive gate selection with matrix displays
- **Simulation Results**: Probability distributions and measurement outcomes
- **Circuit Grid**: Visual quantum circuit builder

### Technical Features
- **Multi-Qubit Support**: Simulate circuits with up to 4 qubits
- **Complex Matrix Operations**: Full quantum gate matrix calculations using MathJS
- **Error Boundaries**: Robust error handling for component failures
- **Responsive Design**: Works on desktop and tablet devices

## 🛠 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/CastanedaNetworks/quantum-circuit-simulator.git
cd quantum-circuit-simulator

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:5173
```

## 📖 Usage

### Building Circuits
1. **Select Gates**: Choose quantum gates from the enhanced gate palette
2. **Drag & Drop**: Place gates on the circuit grid by dragging them to desired positions
3. **View Results**: Simulation runs automatically, showing probability distributions
4. **3D Visualization**: Switch to the 3D view to see your circuit in three dimensions

### Exploring Algorithms
1. **Browse Templates**: Navigate to the Algorithms tab
2. **Select Algorithm**: Choose from pre-built quantum algorithm templates
3. **Step Through**: Execute algorithms step-by-step with educational explanations
4. **Modify & Experiment**: Customize algorithms and see how changes affect results

### Understanding Quantum States
1. **Bloch Sphere**: Visualize single-qubit states on an interactive Bloch sphere
2. **Matrix View**: Click gates to see their mathematical matrix representations
3. **State Evolution**: Watch how quantum states evolve as gates are applied

## 🏗 Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React DnD**: Drag and drop functionality

### Quantum Simulation
- **MathJS**: Complex number mathematics and matrix operations
- **Custom Simulator**: Pure JavaScript quantum state simulation
- **Gate Operations**: Comprehensive quantum gate implementations

### 3D Visualization
- **Three.js**: WebGL-based 3D rendering
- **Interactive Controls**: Camera controls and scene interaction
- **Real-time Updates**: Dynamic circuit visualization

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── AlgorithmStepExecutor.tsx
│   ├── AlgorithmTemplateSelector.tsx
│   ├── BlochSphere.tsx
│   ├── CircuitBuilder.tsx
│   ├── CircuitGrid.tsx
│   ├── CircuitVisualization3D.tsx
│   ├── DraggableGate.tsx
│   ├── EnhancedGatePalette.tsx
│   ├── ErrorBoundary.tsx
│   ├── SimulationResults.tsx
│   └── VisualCircuitBuilder.tsx
├── quantum/              # Quantum simulation logic
│   ├── gates.ts         # Quantum gate definitions
│   ├── operations.ts    # Quantum operations
│   ├── simulator.ts     # Main simulation engine
│   └── state.ts         # Quantum state management
├── types/               # TypeScript type definitions
│   ├── algorithms.ts    # Algorithm-related types
│   ├── dragAndDrop.ts   # Drag & drop types
│   └── quantum.ts       # Quantum system types
├── utils/               # Utility functions
└── styles/              # CSS and styling
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
```

### Building for Production
```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory.

## 🎯 Roadmap

- [ ] Additional quantum gates (Toffoli, Fredkin, rotation gates)
- [ ] Quantum error correction visualization
- [ ] Advanced algorithms (Shor's algorithm, quantum machine learning)
- [ ] Circuit optimization suggestions
- [ ] Export/import circuit functionality
- [ ] Collaborative editing features
- [ ] Mobile app version

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Ensure all linting checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Wiki](https://github.com/CastanedaNetworks/quantum-circuit-simulator/wiki)
- **Issues**: [GitHub Issues](https://github.com/CastanedaNetworks/quantum-circuit-simulator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CastanedaNetworks/quantum-circuit-simulator/discussions)

## 👥 Authors

- **Louis Castaneda** - *Initial work* - [CastanedaNetworks](https://github.com/CastanedaNetworks)

## 🙏 Acknowledgments

- Inspired by IBM Qiskit and other quantum computing frameworks
- Three.js community for 3D visualization techniques
- React DnD for drag and drop functionality
- MathJS for complex number mathematics

## 📊 Technical Specifications

- **Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Node.js Version**: 18+ required
- **Bundle Size**: ~1.2MB (minified + gzipped: ~318KB)
- **Performance**: Optimized for circuits up to 4 qubits

---

Made with ❤️ by [Castaneda Networks](https://github.com/CastanedaNetworks)
