/**
 * Copyright 2014 Curiosity driven
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function *lexer(text) {
    var tokenRegexp = /[A-Za-z_]+|:\-|[()\.,]/g;
    var match;
    while ((match = tokenRegexp.exec(text)) !== null) {
        yield match[0];
    }
}

function parser(tokens) {
    var current, done, scope;
    function next() {
        var next = tokens.next();
        current = next.value;
        done = next.done;
    }
    function parseAtom() {
        var name = current;
        if (!/^[A-Za-z_]+$/.test(name)) {
            throw new SyntaxError('Bad atom name: ' + name);
        }
        next();
        return name;
    }
    function parseTerm() {
        if (current === '(') {
            next(); // eat (
            var args = [];
            while (current !== ')') {
                args.push(parseTerm());
                if (current !== ',' && current !== ')') {
                    throw new SyntaxError('Expected , or ) in term but got ' + current);
                }
                if (current === ',') {
                    next(); // eat ,
                }
            }
            next(); // eat )
            return new Conjunction(args);
        }
        var functor = parseAtom();
        if (/^[A-Z_][A-Za-z_]*$/.test(functor)) {
            if (functor === '_') {
                return new Variable('_');
            }
            // variable X in the same scope should point to the same object
            var variable = scope[functor];
            if (!variable) {
                variable = scope[functor] = new Variable(functor);
            }
            return variable;
        }
        if (current !== '(') {
            return new Term(functor);
        }
        next(); // eat (
        var args = [];
        while (current !== ')') {
            args.push(parseTerm());
            if (current !== ',' && current !== ')') {
                throw new SyntaxError('Expected , or ) in term but got ' + current);
            }
            if (current === ',') {
                next(); // eat ,
            }
        }
        next(); // eat )
        return new Term(functor, args);
    }
    function parseRule() {
        var head = parseTerm();
        if (current === '.') {
            next(); // eat .
            return new Rule(head, Term.TRUE);
        }
        if (current !== ':-') {
            throw new SyntaxError('Expected :- in rule but got ' + current);
        }
        next(); // eat :-
        var args = [];
        while (current !== '.') {
            args.push(parseTerm());
            if (current !== ',' && current !== '.') {
                throw new SyntaxError('Expected , or ) in term but got ' + current);
            }
            if (current === ',') {
                next(); // eat ,
            }
        }
        next(); // eat .
        var body;
        if (args.length === 1) {
            // body is a regular Term
            body = args[0];
        } else {
            // body is a conjunction of all terms
            body = new Conjunction(args);
        }
        return new Rule(head, body);
    }
    next(); // start the tokens iterator
    return {
        parseRules: function() {
            var rules = [];
            while (!done) {
                // each rule gets its own scope for variables
                scope = { };
                rules.push(parseRule());
            }
            return rules;
        },
        parseTerm: function() {
            scope = { };
            return parseTerm();
        }
    };
}