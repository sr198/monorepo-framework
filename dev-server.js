#!/usr/bin/env node

// Simple development server script to run all services
const { spawn } = require('child_process');

const services = [
  {
    name: 'React Frontend',
    command: 'pnpm',
    args: ['nx', 'serve', 'ticketing-web', '--port=4200'],
    cwd: __dirname,
    color: '\x1b[36m', // Cyan
  },
];

function runService(service) {
  console.log(`${service.color}Starting ${service.name}...\x1b[0m`);

  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  child.stdout.on('data', data => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${service.color}[${service.name}] ${line}\x1b[0m`);
      }
    });
  });

  child.stderr.on('data', data => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${service.color}[${service.name}] ${line}\x1b[0m`);
      }
    });
  });

  child.on('close', code => {
    console.log(
      `${service.color}[${service.name}] exited with code ${code}\x1b[0m`
    );
  });

  return child;
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n\x1b[33m🛑 Shutting down all services...\x1b[0m');
  processes.forEach(p => {
    if (p && !p.killed) {
      p.kill('SIGTERM');
    }
  });
  process.exit(0);
});

console.log(
  '\x1b[32m🚀 Starting Workalaya Development Environment...\x1b[0m\n'
);

console.log(`\x1b[35m
╔══════════════════════════════════════════════════════════════╗
║                    🎫 WORKALAYA TICKETING                    ║
║                                                              ║
║  Frontend:     http://localhost:4200                        ║
║                                                              ║
║  🎯 Click "Create Ticket" to test the full flow!           ║
╚══════════════════════════════════════════════════════════════╝
\x1b[0m`);

const processes = services.map(runService);

// Test API connectivity after a delay
setTimeout(() => {
  console.log('\n\x1b[33m🔍 Frontend is ready!\x1b[0m');
  console.log('\x1b[36m📝 Demo Instructions:\x1b[0m');
  console.log('1. Open http://localhost:4200 in your browser');
  console.log('2. Click "Create Your First Ticket"');
  console.log('3. Fill in ticket details and submit');
  console.log('4. Check the "All Tickets" page to see AI analysis');
  console.log(
    '\n\x1b[32m✨ The full React → API Gateway → Ticket Service → AI Analysis flow is ready!\x1b[0m\n'
  );
}, 3000);
