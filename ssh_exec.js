const { Client } = require('ssh2');

const conn = new Client();

const command = process.argv[2];
if (!command) {
  console.error('Usage: node ssh_exec.js "<command>"');
  process.exit(1);
}

conn.on('ready', () => {
  conn.exec(command, (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      process.exit(1);
    }
    
    stream.on('close', (code) => {
      conn.end();
      process.exit(code);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '72.62.171.225',
  port: 22,
  username: 'root',
  password: 'Word@Word+1234'
});

conn.on('error', (err) => {
  console.error('Connection error:', err);
  process.exit(1);
});
