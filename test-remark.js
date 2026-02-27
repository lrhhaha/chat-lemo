const { unified } = require('unified')
const remarkParse = require('remark-parse')

const processor = unified().use(remarkParse)
const tree = processor.parse('```tsx artifact title="Counter"\nconsole.log("hello")\n```')
console.log(tree.children[0])
