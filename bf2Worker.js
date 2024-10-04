importScripts('./BF2.js');

onmessage = async function(e) {
  const { code, showTape } = e.data;

  try {
    const startTime = performance.now(); // Start time inside the worker
    const interpreter = new BF2Interpreter(); // Create a new interpreter instance
    const output = await interpreter.run(code, showTape);
    const endTime = performance.now(); // End time inside the worker

    postMessage({
      result: output.result,
      tape: output.tape,
      executionTime: endTime - startTime, // Calculate time inside the worker
    });
  } catch (error) {
    postMessage({ error: error.message });
  }
};
