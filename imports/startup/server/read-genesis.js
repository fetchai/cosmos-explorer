import { Blockscon } from '../../api/blocks/blocks.js';

const blocksCount = Blockscon.find({}).count();
console.log(blocksCount);
