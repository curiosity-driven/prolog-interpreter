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

document.getElementById('submit').addEventListener('click', function() {
    var rules = parser(lexer(document.getElementById('rules').value)).parseRules();

    var db = new Database(rules);

    var goalText = document.getElementById('query').value;

    var goal = parser(lexer(goalText)).parseTerm();

    var list = document.getElementById('answers');
    list.innerHTML = '';

    for (var item of db.query(goal)) {
        var li = document.createElement('LI');
        li.textContent = item;
        list.appendChild(li);
    }
    
    if (list.innerHTML === '') {
      list.innerHTML = 'No solutions';
    }
});