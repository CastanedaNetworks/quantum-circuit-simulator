// Quantum Logic Test - ES Modules
import { complex } from 'mathjs';

console.log('🧮 QUANTUM LOGIC VERIFICATION TEST');
console.log('===================================');

// Test Bell State Creation Mathematically
console.log('\n🔬 MATHEMATICAL VERIFICATION:');

console.log('\nStep 1: Initial state |00⟩');
console.log('State vector: [1, 0, 0, 0] (|00⟩, |01⟩, |10⟩, |11⟩)');

console.log('\nStep 2: Apply H to qubit 0');
console.log('H ⊗ I = 1/√2 * [[1,1,0,0], [1,-1,0,0], [0,0,1,1], [0,0,1,-1]]');
console.log('Result: [1/√2, 0, 1/√2, 0] = (|00⟩ + |10⟩)/√2');

console.log('\nStep 3: Apply CNOT(0,1)');
console.log('CNOT = [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]');
console.log('Result: [1/√2, 0, 0, 1/√2] = (|00⟩ + |11⟩)/√2');

console.log('\nPROBABILITIES:');
console.log('P(|00⟩) = |1/√2|² = 0.5 = 50%');
console.log('P(|01⟩) = |0|² = 0.0 = 0%');
console.log('P(|10⟩) = |0|² = 0.0 = 0%');
console.log('P(|11⟩) = |1/√2|² = 0.5 = 50%');

console.log('\n✅ This is a maximally entangled Bell state!');

// Test Gate Matrices
console.log('\n🚪 GATE MATRIX VERIFICATION:');

const sqrt2 = Math.sqrt(2);

console.log('\nHadamard Gate:');
console.log('H = 1/√2 * [[1, 1], [1, -1]]');
const h_expected = `[[${(1/sqrt2).toFixed(3)}, ${(1/sqrt2).toFixed(3)}], [${(1/sqrt2).toFixed(3)}, ${(-1/sqrt2).toFixed(3)}]]`;
console.log(`Expected: ${h_expected}`);

console.log('\nPauli-X Gate:');
console.log('X = [[0, 1], [1, 0]]');

console.log('\nPauli-Y Gate:');
console.log('Y = [[0, -i], [i, 0]]');

console.log('\nPauli-Z Gate:');
console.log('Z = [[1, 0], [0, -1]]');

console.log('\nCNOT Gate:');
console.log('CNOT = [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]');

console.log('\n🎯 UI TEST CHECKLIST:');
console.log('=====================');

console.log('\n1. DRAG & DROP TEST:');
console.log('   □ Drag H gate from palette to q0 position');
console.log('   □ Verify H gate appears in grid cell');
console.log('   □ Drag CNOT gate from palette to q0 position (next column)');
console.log('   □ Verify CNOT shows control on q0 and target on q1');
console.log('   □ Double-click gates to remove them');

console.log('\n2. SIMULATION TEST:');
console.log('   □ Place H on q0, CNOT(q0→q1)');
console.log('   □ Click "Run Circuit" button');
console.log('   □ Check simulation results show:');
console.log('     - |00⟩: ~50.0%');
console.log('     - |11⟩: ~50.0%');
console.log('     - |01⟩: ~0.0%');
console.log('     - |10⟩: ~0.0%');

console.log('\n3. VISUALIZATION TEST:');
console.log('   □ Bloch sphere updates when circuit runs');
console.log('   □ Individual qubit probabilities display correctly');
console.log('   □ 3D circuit visualization shows placed gates');
console.log('   □ Measurement probability bars update');

console.log('\n4. BUTTON FUNCTIONALITY TEST:');
console.log('   □ "Run Circuit" executes simulation');
console.log('   □ "Clear All" removes all gates');
console.log('   □ "Export Circuit" downloads JSON file');
console.log('   □ "Connection Mode" toggle works');

console.log('\n5. ALGORITHMS TAB TEST:');
console.log('   □ Switch to "Algorithms" tab');
console.log('   □ Click on "Bell State Preparation"');
console.log('   □ Verify it loads H + CNOT circuit');
console.log('   □ Run the algorithm and verify 50/50 results');

console.log('\n6. ERROR HANDLING TEST:');
console.log('   □ Try to place gates outside grid (should fail gracefully)');
console.log('   □ Try to place multiple gates in same cell (should prevent)');
console.log('   □ Run empty circuit (should show initial state)');

console.log('\n🔍 EXPECTED CONSOLE OUTPUT:');
console.log('===========================');
console.log('When running the app, you should see:');
console.log('- [App] Component initializing...');
console.log('- [QuantumSimulator] Creating simulator with 4 qubits');
console.log('- [QuantumState] Creating quantum state with 4 qubits');
console.log('- [App] QuantumSimulator created successfully');
console.log('- [CircuitGrid] Rendering with 4 qubits, 8 columns...');
console.log('- [EnhancedGatePalette] Rendering with 5 total gates...');

console.log('\nWhen dragging gates:');
console.log('- [DraggableGate] Rendering gate: Hadamard selected: false');
console.log('- [CircuitGrid] Gate placed at position...');

console.log('\nWhen running simulation:');
console.log('- [App] Running simulation with circuit: [...]');
console.log('- [QuantumSimulator] Executing circuit with X gates');
console.log('- [App] Simulation successful, result: {...}');

console.log('\n🎉 MANUAL TESTING INSTRUCTIONS:');
console.log('===============================');
console.log('1. Open http://localhost:5177 in browser');
console.log('2. Open browser developer tools (F12)');
console.log('3. Check Console tab for any errors');
console.log('4. Follow the UI test checklist above');
console.log('5. Verify each ✅ item works as expected');
console.log('6. Report any ❌ failures with error messages');

console.log('\n⚡ Test preparation complete!');