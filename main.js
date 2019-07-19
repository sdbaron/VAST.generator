const pug = require('pug')

// Compile the source code
// const compiledFunction = pug.compileFile('srcVAST.pug');

// // Render a set of data
// console.log(compiledFunction({
//   name: 'Timothy'
// }));
// // "<p>Timothy's Pug source code!</p>"
//
// // Render another set of data
// console.log(compiledFunction({
//   name: 'Forbes'
// }));
// // "<p>Forbes's Pug source code!</p>"
//
// Compile template.pug, and render a set of data
// const compiledFunction = pug.compileFile('templates/VAST.wrapper.pug', {
//   doctype: 'xml'
// });

// console.log(compiledFunction({
//   id: '1',
//   skipTime: '00:05',
//   AdSystem: 'Videonow.ru',
//   AdTitle: 'Videonow.ru title'
// }));

const DEFAULT_SERVER = '{{API-SERVER}}'
const VAST_TYPE = {
  ROOT: 0,
  INLINE: 1,
  WRAPPER: 2,
  VN_DEFAULT_AD: 4
}

const VAST_TYPE_TEMPLATE = {
  [VAST_TYPE.ROOT]: 'VAST.root.pug',
  [VAST_TYPE.INLINE]: 'VAST.inline.pug',
  [VAST_TYPE.WRAPPER]: 'VAST.wrapper.pug',
  [VAST_TYPE.VN_DEFAULT_AD]: 'VAST.vnDefaultAd.pug'
}
const COMPILE_OPTIONS = { doctype: 'xml' }

const vnControlsNames = [
  'close',
  'countdown',
  'soundbtn',
  'progress',
  'logo',
  'adlabel',
  'advLogo',
  'progressbar',
  'callbutton',
  'moreinfo',
  'bottomborder',
  'background'
]

function getControlsInfo(names, attributes = {}) {
  const attrs = attributes.reduce((prev, cur) => ({ ...prev, ...cur }), {})
  return names.map(id => ({ id, ...attrs }))
}

function assemblyVnDefaultAd(type, params) {
  const itemFn = pug.compileFile(`templates/${VAST_TYPE_TEMPLATE[type]}`, COMPILE_OPTIONS)
  const VASTItem = itemFn(params)

  const vnDefaultAd = pug.compileFile(`templates/${VAST_TYPE_TEMPLATE[VAST_TYPE.VN_DEFAULT_AD]}`, COMPILE_OPTIONS)

  return vnDefaultAd({ ...params, VASTItem })
}

function assemblyMain(type, params) {
  const itemFn = pug.compileFile(`templates/${VAST_TYPE_TEMPLATE[type]}`, COMPILE_OPTIONS)

  const VASTItem = itemFn(params)

  const rootFn = pug.compileFile(`templates/${VAST_TYPE_TEMPLATE[VAST_TYPE.ROOT]}`, COMPILE_OPTIONS)

  return rootFn({ ...params, VASTItem })
}


const rootVnDefaultAdParams = {
  id: '2',
  VASTAdTagURI: 'Creative.xml 2',
  AdSystem: 'Videonow.ru 2',
  AdTitle: 'Videonow.ru title 2',
  skipTime: '00:05',
  duration: '00:17'
}

const rootVnDefaultAd = assemblyVnDefaultAd(VAST_TYPE.INLINE, rootVnDefaultAdParams)

const params = {
  id: '1',
  VASTAdTagURI: 'Creative.xml',
  AdSystem: 'Videonow.ru',
  AdTitle: 'Videonow.ru title',
  skipTime: '00:05',
  vnControls: getControlsInfo(vnControlsNames, [{ enableWithVPAID: "true" }]),
  viewableImpression: {
    mainTag: { name: 'ViewableImpression', attr: { skipoffset: '00:05' } },
    childTags: [
      { name: 'global', content: 'true' },
      {
        count: 2,
        name: 'Viewable',
        content: '<![CDATA[{{API-SERVER}}/event/ViewableImpression.viewable/[[DATA]]]]>',
        prefix: 'g-'
      }
    ]
  },
  vnVisibleInventory: {
    mainTag: { name: 'Extension', attr: { type: 'vnVisibleInventory' } },
    childTags: [
      {
        count: 2,
        name: 'url',
        content: '<![CDATA[{{API-SERVER}}/event/visibleInventory/[[DATA]]]]>',
      }
    ]
  },
  vnDefaultAd: rootVnDefaultAd,

}
// enableWithVPAID

const main = assemblyMain(VAST_TYPE.WRAPPER, params)
console.log(main)
