# 🔍 **DRAG & DROP DEBUG INSTRUCTIONS**

## Current Status
- ✅ DndProvider wrapping entire app
- ✅ HTML5Backend configured with mouse events enabled
- ✅ Debug test component added
- ✅ Console logging added to drag sources and drop targets
- ✅ React-DnD v11.1.3 installed and importing correctly

## Manual Testing Steps

### 1. **Open Browser Console**
- Navigate to: http://localhost:5178
- Open Developer Tools (F12)
- Go to Console tab

### 2. **Look for Initial Logs**
You should see:
```
[App] Rendering with DndProvider, backend: [Function HTML5Backend]
🟢 DRAG TEST: Component mounting
🟢 DRAG TEST: DragSource render, isDragging: false
🟢 DROP TEST: DropTarget render, isOver: false canDrop: false
[DraggableGate] Rendering gate: Hadamard selected: false
[DraggableGate] isDragging: false drag ref: true
```

### 3. **Test the Debug Component**
- Look for yellow box at top with "React-DnD Test" 
- Try dragging the red "Drag Me" box to the gray "Drop Here" box
- **If this works**: React-DnD is functional, issue is with quantum gates
- **If this fails**: React-DnD setup issue

### 4. **Test Quantum Gate Dragging**
- Try dragging any gate (H, X, Y, Z, CNOT) from right palette
- Look for these console messages:
  - `[DraggableGate] Mouse down on: Hadamard`
  - `[DraggableGate] Drag started for: Hadamard`

### 5. **Test Grid Drop Targets**
- When hovering over circuit grid cells while dragging:
  - Look for: `[GridCell] Hover state: {row: 0, col: 0, isOver: true, canDrop: true}`
  - Grid cells should highlight green when dragging over them

### 6. **Test Successful Drop**
- When dropping gate on grid cell:
  - Look for: `[GridCell] Item dropped: {...} at position: 0 0`
  - Look for: `[GridCell] Calling onDrop for gate: Hadamard`

## Debugging Scenarios

### **Scenario A: Debug test works, gates don't**
**Issue**: Quantum gate drag setup
**Solutions**:
- Check DragTypes.GATE constant matches
- Verify gate data structure is correct
- Check if gate palette is inside DndProvider scope

### **Scenario B: No drag events fire at all**
**Issue**: React-DnD backend not working
**Solutions**:
- Check browser compatibility (Chrome/Firefox recommended)
- Disable browser extensions that might interfere
- Try enabling touch events in backend options

### **Scenario C: Drag starts but drop doesn't work**
**Issue**: Drop target configuration
**Solutions**:
- Check `accept` types match between source and target
- Verify drop zones are properly configured
- Check z-index and CSS positioning

### **Scenario D: Gates appear draggable but don't move**
**Issue**: CSS or event handling interference
**Solutions**:
- Remove `user-select: none` or similar CSS
- Check for event.preventDefault() calls
- Verify cursor changes to grab/grabbing

## Expected Working Flow

1. **Mouse Down** on gate → Console: "Mouse down on: Hadamard"
2. **Drag Start** → Console: "Drag started for: Hadamard" + visual feedback
3. **Hover over grid** → Console: "Hover state" + green highlight  
4. **Drop on grid** → Console: "Item dropped" + gate appears in cell
5. **Drag End** → Console: "Drag ended, dropped: true"

## Quick Fixes to Try

### **Fix 1: Disable Other Event Handlers**
Remove any `onMouseDown`, `onClick` that might interfere:
```tsx
// Remove or comment out these in DraggableGate:
// onMouseDown={() => ...}
// onClick={...}
```

### **Fix 2: Force Cursor Style**
Add to DraggableGate CSS:
```css
cursor: grab !important;
&:active { cursor: grabbing !important; }
```

### **Fix 3: Check Parent Containers**
Ensure no parent has:
- `pointer-events: none`
- `overflow: hidden` that clips drag preview
- `position: relative` without proper z-index

### **Fix 4: Backend Options**
Try different backend options in App.tsx:
```tsx
const backendOptions = {
  enableMouseEvents: true,
  enableKeyboardEvents: false,
  enableTouchEvents: true, // Try enabling
};
```

## Success Indicators ✅

When drag & drop is working correctly:

1. **Visual**: Gates show grab cursor and drag preview
2. **Console**: All debug messages appear in sequence  
3. **Functional**: Gates can be placed and moved in circuit
4. **Interactive**: Grid cells highlight during drag hover
5. **Responsive**: Smooth drag animations and state updates

---

**Next Step**: Check the browser console and report back what you see when trying to drag the test component and the quantum gates!