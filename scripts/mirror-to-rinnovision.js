#!/usr/bin/env node
const { execSync } = require('node:child_process');
const readline = require('node:readline');

const main = async () => {
  const readLineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.info('\nThis will execute the following git commands:');
    console.info('\tgit fetch -p origin');
    console.info('\tgit push --prune mirror "+refs/heads/*:refs/heads/*" "+refs/tags/*:refs/tags/*"');
    await askConfirmation({ 
      readLineInterface, 
      question: '\n→ [Enter] to proceed \n→ [Ctrl-C] to abort\n' 
    });

    console.info('\nFetching from origin...');
    execSync('git fetch -p origin', { stdio: 'inherit' });
    console.info('\t✔️ Fetch completed');

    console.info('\nPushing to mirror...');
    execSync('git push --mirror mirror', { stdio: 'inherit' });
    console.info('\t✔️ Mirror push completed');

    console.info('\n✅ Mirror to rinnovision completed successfully');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    readLineInterface.close();
  }
};

const askConfirmation = ({ readLineInterface, question = '' }) => {
  return new Promise((resolve) => {
    readLineInterface.question(question, (answer) => resolve(answer));
  });
};

// Run the script
main();

