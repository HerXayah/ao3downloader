import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs-extra';
import * as stream from 'stream';
import { promisify } from 'util';
import inquirer from 'inquirer';

const finishedDownload = promisify(stream.finished);

//let ao3ID = '69188231 66069910';
let ao3URL = `https://archiveofourown.org`;

async function main() {
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
      }

      if (!trimmed) continue;

      const ids = trimmed.split(' ').filter(Boolean);
      for (const id of ids) {
         console.log(`\n Processing ${id}...`);
         await getAO3Title(id);
         console.log(`Finished downloading ${id}!`);
      }
      console.log('\n');
   }
}

main();

function getAO3Title(ids: string) {
   const url = `${ao3URL}/works/`;
   let idarray = ids.split(' ');
   idarray.forEach((id) => {
      webscraping(`${url}${id}`).then((value) => {
         // check if files exist
         if (fs.existsSync(`./books/${value.replace(' ', '_')}.epub`)) {
            console.log(
               `The file already exists! \n Please delete or move ${value.replace(
                  ' ',
                  '_'
               )}.epub to re-download it! \n`
            );
         } else {
            downloadEPUB(value, id).then((downloadedFile) => {
               finishedDownload(
                  downloadedFile.data.pipe(
                     fs.createWriteStream(
                        `./books/${value.replace(' ', '_')}.epub`
                     )
                  )
               );
            });
         }
      });
   });
}

async function webscraping(url: string) {
   const response = axios.get(url);
   let html = (await response).data;
   const $ = load(html);
   const titleElement = $('div.preface').first();
   return $(titleElement).find('h2').first().text().trim();
}

async function downloadEPUB(name: string, id: string) {
   const downloadEPUBURL = `https://archiveofourown.org/downloads/${id}/${name.replace(
      ' ',
      '_'
   )}.epub`;
   return await axios({
      method: 'GET',
      url: downloadEPUBURL,
      responseType: 'stream',
   });
}
