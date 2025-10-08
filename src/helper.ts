import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs-extra';
import * as stream from 'stream';
import { promisify } from 'util';

const finishedDownload = promisify(stream.finished);

let ao3URL = `https://archiveofourown.org`;

export async function getAO3Title(ids: string) {
   const url = `${ao3URL}/works/`;
   let idarray = ids.split(' ');
   for (const id of idarray) {
      try {
         await webscraping(`${url}${id}`).then(async (value) => {
            // check if files exist
            const name = `${value.replace(' ', '_')}.epub`;
            const path = './books/';
            if (fs.existsSync(`${path}${name}`)) {
               console.log(
                  `\nThe file already exists! \nPlease delete or move ${name} to re-download it! \n`
               );
            } else {
               const downloadedFile = await downloadEPUB(value, id);
               await finishedDownload(
                  downloadedFile.data.pipe(
                     fs.createWriteStream(`${path}${name}`)
                  )
               );
            }
         });
      } catch (error) {
         console.log('\nWe got an Error! ' + error + '\n');
      }
   }
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

export async function checkFolder(path: string) {
   if (fs.pathExistsSync(`${__dirname}/../${path}`)) {
      return false;
   } else {
      return true;
   }
}
