// Quick test to check if pdflatex is available from Node.js
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testPdflatex() {
  console.log('Testing pdflatex availability...\n');

  console.log('Environment PATH:');
  console.log(process.env.PATH);
  console.log('\n');

  try {
    const { stdout, stderr } = await execAsync('pdflatex --version', { timeout: 5000 });
    console.log('✓ pdflatex is available!');
    console.log('\nVersion info:');
    console.log(stdout);
  } catch (error) {
    console.log('✗ pdflatex is NOT available');
    console.log('\nError:', error.message);
    console.log('\nPlease:');
    console.log('1. Make sure MiKTeX is installed');
    console.log('2. Add MiKTeX to PATH: C:\\Program Files\\MiKTeX\\miktex\\bin\\x64');
    console.log('3. Restart your terminal/VS Code');
    console.log('4. Run this test again');
  }
}

testPdflatex();
