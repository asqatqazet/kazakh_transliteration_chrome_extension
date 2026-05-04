// One-shot baseline generator: runs the LEGACY Cyrillic↔Arabic converter
// over the test corpus and writes the outputs to a JSON file. The new TS
// converter is then asserted to match this baseline.
//
// Run: node scripts/generate-arabic-baseline.mjs
//
// The legacy logic below is copied verbatim from the original contentScript.js
// (lines 136-187 + 145, sans DOM glue). Do not "fix" it — the point is to
// snapshot exactly what the published v1.0 extension produces.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpusPath = resolve(__dirname, '../tests/converter/__fixtures__/kazakh-corpus.json');
const baselinePath = resolve(
  __dirname,
  '../tests/converter/__fixtures__/cyrillic-arabic-baseline.json'
);

// ─── LEGACY CODE (verbatim from contentScript.js) ──────────────────────────

function replaceStr(a, b, c, d) {
  d = d || 'g';
  for (const e in b) {
    a = a.replace(new RegExp(b[e], d), c[e]);
  }
  return a;
}

const toteReg = /([،؟؛ءابتجحدر-شعف-نو-يپچڭگھۆۇۋە]+)/g;

class LegacyConverter {
  cyrillic2arabic(a) {
    a = replaceStr(
      a,
      [
        'А',
        'Ә',
        'Б',
        'В',
        'Г',
        'Ғ',
        'Д',
        'Е',
        'Ё',
        'Ж',
        'З',
        'И',
        'Й',
        'К',
        'Қ',
        'Л',
        'М',
        'Н',
        'Ң',
        'О',
        'Ө',
        'П',
        'Р',
        'С',
        'Т',
        'У',
        'Ұ',
        'Ү',
        'Ф',
        'Х',
        'Һ',
        'Ц',
        'Ч',
        'Ш',
        'Щ',
        'Ъ',
        'Ы',
        'І',
        'Ь',
        'Э',
        'Ю',
        'Я',
        '\\,',
        '\\;',
        '\\?',
      ],
      [
        'ا',
        'ءا',
        'ب',
        'ۆ',
        'گ',
        'ع',
        'د',
        'ە',
        'يو',
        'ج',
        'ز',
        'ي',
        'ي',
        'ك',
        'ق',
        'ل',
        'م',
        'ن',
        'ڭ',
        'و',
        'ءو',
        'پ',
        'ر',
        'س',
        'ت',
        'ۋ',
        'ۇ',
        'ءۇ',
        'ف',
        'ح',
        'ھ',
        'س',
        'چ',
        'ش',
        'شش',
        '',
        'ى',
        'ءى',
        '',
        'ە',
        'يۋ',
        'يا',
        '،',
        '؛',
        '؟',
      ],
      'gi'
    );
    a = a.replace(/ييا/g, 'يا');
    return a.replace(toteReg, function (d) {
      function b(c) {
        return c.replace(/ء/g, '');
      }
      return d.search(/ء/) >= 0 && d.search(/[گكە]/) < 0 ? 'ء' + b(d) : b(d);
    });
  }

  arabic2cyrillic(a) {
    function initials(val) {
      val = val.toLowerCase();
      val = val.replace(/([\n!.?]+|^\s*)([\s!-@[-`{-~¡-¿×÷]*)./g, (str) => str.toUpperCase());
      return val;
    }
    a = a.replace(toteReg, function (val) {
      const b = [
        'ا',
        'ب',
        'ۆ',
        'گ',
        'ع',
        'د',
        'ە',
        'ج',
        'ز',
        'ي',
        'ك',
        'ق',
        'ل',
        'م',
        'ن',
        'ڭ',
        'و',
        'پ',
        'ر',
        'س',
        'ت',
        'ۋ',
        'ۇ',
        'ف',
        'ح',
        'ھ',
        'چ',
        'ش',
        'ى',
        '،',
        '؛',
        '؟',
      ];
      const c = [
        'а',
        'б',
        'в',
        'г',
        'ғ',
        'д',
        'е',
        'ж',
        'з',
        'и',
        'к',
        'қ',
        'л',
        'м',
        'н',
        'ң',
        'о',
        'п',
        'р',
        'с',
        'т',
        'у',
        'ұ',
        'ф',
        'х',
        'һ',
        'ч',
        'ш',
        'ы',
        ',',
        ';',
        '?',
      ];
      if (val.search(/[ءەگك]/) < 0) {
        val = replaceStr(val, b, c, 'g');
      } else {
        val = replaceStr(val, b, c, 'g');
        val = val.replace(/а/, 'Ә');
        val = val.replace(/о/, 'Ө');
        val = val.replace(/ы/, 'І');
        val = val.replace(/ұ/, 'Ү');
        val = val.replace(/ء/g, '');
      }
      return val;
    });
    return initials(a);
  }
}

// ─── BASELINE GENERATION ───────────────────────────────────────────────────

const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
const legacy = new LegacyConverter();

const baseline = corpus.map((cyrillic) => {
  const arabic = legacy.cyrillic2arabic(cyrillic);
  const roundTrip = legacy.arabic2cyrillic(arabic);
  return { cyrillic, arabic, roundTrip };
});

writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n');
console.log(`Wrote baseline: ${baseline.length} entries → ${baselinePath}`);
