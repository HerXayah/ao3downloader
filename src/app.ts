import { getAO3Title, checkFolder } from './helper';
import inquirer from 'inquirer';
import fs from 'fs';

async function main() {
   if (await checkFolder('/books/')) {
      try {
         fs.mkdirSync(`${__dirname}/../books/`);
      } catch (error) {
         console.log(error);
      }
   }
   while (true) {
      const { input } = await inquirer.prompt([
         {
            type: 'input',
            name: 'input',
            message: "What do you want (IDs separated by spaces or 'exit')?",
         },
      ]);

      const trimmed = input.trim().toLowerCase();
      if (trimmed === 'exit' || trimmed === 'quit') {
         console.log('Exiting...');
         process.exit(0);
      } else if (trimmed.match('[a-zA-Z]+')) {
         console.log('\nPlease input numbers only!\n');
         continue;
      }

      if (!trimmed) continue;

      const ids = trimmed.split(' ').filter(Boolean);
      for (const id of ids) {
         console.log(`\nProcessing ${id}...`);
         await getAO3Title(id);
      }
      console.log('\nFinished all files!\n');
   }
}

main();
