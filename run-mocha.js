const { execSync } = require('child_process');

// Устанавливаем переменные окружения
process.env.NO_EVAL = 'true';

console.log('Running tests with NO_EVAL=true...');
try {
    execSync('npx mocha --require ts-node/register --extensions ts --require ./mocha.setup.js tests/specs/**/*.spec.ts', { 
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, TS_NODE_PROJECT: 'tsconfig.mocha.json' }
    });
    console.log('First run completed successfully');
} catch (error) {
    console.error('First run failed:', error.message);
    process.exit(1);
}

// Второй запуск без NO_EVAL
process.env.NO_EVAL = '';
console.log('Running tests without NO_EVAL...');
try {
    execSync('npx mocha --require ts-node/register --extensions ts --require ./mocha.setup.js tests/specs/**/*.spec.ts', { 
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, TS_NODE_PROJECT: 'tsconfig.mocha.json' }
    });
    console.log('Second run completed successfully');
} catch (error) {
    console.error('Second run failed:', error.message);
    process.exit(1);
}

console.log('All tests completed successfully!');
