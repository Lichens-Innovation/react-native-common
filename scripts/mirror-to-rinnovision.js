#!/usr/bin/env node
const { execSync } = require('node:child_process');
const readline = require('node:readline');

/**
 * Before running the script, you need to:
 * - remove the existing mirror remote (if any)
 * - add the new mirror remote (if not already added)
 *
 * git remote remove mirror
 * git remote add mirror git@github.com:RinnoVision/react-native-commun.git
 */

const GIT_COMMANDS = {
  FETCH: 'git fetch --prune origin',
  PUSH: 'git push --force --prune mirror "+refs/remotes/origin/*:refs/heads/*" "+refs/tags/*:refs/tags/*"',
};

const main = async () => {
  const readLineInterface = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout 
  });

  try {
    console.info('\nThis will execute the following git commands:');
    console.info(`\t${GIT_COMMANDS.FETCH}`);
    console.info(`\t${GIT_COMMANDS.PUSH}`);
 
    await askConfirmation({ 
      readLineInterface, 
      question: '\n→ [Enter] to proceed \n→ [Ctrl-C] to abort\n' 
    });

    console.info('\nFetching all (branches, tags, commits) and pruning remote branches...');
    execSync(GIT_COMMANDS.FETCH, { stdio: 'inherit' });
    console.info('\t✔️ Fetch completed');

    console.info('\nPushing all (branches, tags, commits) to mirror (also pruning remote branches)...');
    execSync(GIT_COMMANDS.PUSH, { stdio: 'inherit' });
    console.info('\t✔️ Mirror push completed');

    console.info('\n✅ Mirror synchronization completed successfully');
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
