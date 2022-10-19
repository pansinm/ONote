import ohm from 'ohm-js';

const grammar = ohm.grammar(`
  MyGrammar {
    greeting = "Hello" | "Hola"
  }
`);

console.log(grammar.match('Hello'));
