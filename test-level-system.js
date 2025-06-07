/**
 * Script de prueba para validar el sistema de niveles
 * Ejecutar con: node test-level-system.js
 */

// Simulación de las fórmulas del LevelService para validar
function calculateExperienceGain(won) {
  return won ? 2 : 1; // Ganar: 2 exp, Perder: 1 exp
}

function calculateLevelFromExperience(totalExperience) {
  if (totalExperience < 5) return 1;
  
  const adjustedExp = totalExperience - 5; // Experiencia después del nivel 2
  const discriminant = 81 + 8 * adjustedExp; // 9^2 + 4 * 2 * adjustedExp
  const level = Math.floor((-9 + Math.sqrt(discriminant)) / 2) + 2;
  
  return Math.max(1, Math.min(50, level)); // Limitar entre nivel 1 y 50
}

function calculateExperienceForLevel(level) {
  if (level <= 1) return 0;
  if (level === 2) return 5;
  
  // Análisis correcto de la progresión del SQL:
  // Nivel 2: 5 total
  // Nivel 3: 11 total (necesita 6 para subir)
  // Nivel 4: 18 total (necesita 7 para subir)
  // Nivel 5: 26 total (necesita 8 para subir)
  //
  // Fórmula correcta: 5 + sum(5+i, i=1 to level-2)
  // = 5 + 6 + 7 + 8 + ... + (5+(level-2))
  
  let total = 5; // Base para nivel 2
  for (let i = 1; i <= level - 2; i++) {
    total += 5 + i; // 6, 7, 8, 9, etc.
  }
  return total;
}

function getExperienceToNextLevel(currentLevel) {
  if (currentLevel >= 50) return 0; // Nivel máximo alcanzado
  
  return 5 + (currentLevel - 1); // Fórmula: 5 para nivel 2, luego +1 cada nivel
}

// Datos esperados según el SQL
const expectedData = [
  { level: 1, experience: 0 },
  { level: 2, experience: 5 },
  { level: 3, experience: 11 },
  { level: 4, experience: 18 },
  { level: 5, experience: 26 },
  { level: 10, experience: 81 },
  { level: 15, experience: 161 },
  { level: 20, experience: 266 },
  { level: 30, experience: 551 },
  { level: 40, experience: 936 },
  { level: 50, experience: 1421 }
];

console.log('=== VALIDACIÓN DEL SISTEMA DE NIVELES ===\n');

// Validar cálculos de experiencia por nivel
console.log('1. Validando experiencia requerida por nivel:');
let allCorrect = true;

for (const data of expectedData) {
  const calculated = calculateExperienceForLevel(data.level);
  const isCorrect = calculated === data.experience;
  console.log(`Nivel ${data.level}: Esperado=${data.experience}, Calculado=${calculated} ${isCorrect ? '✓' : '✗'}`);
  if (!isCorrect) allCorrect = false;
}

console.log(`\nResultado: ${allCorrect ? 'TODAS LAS FÓRMULAS SON CORRECTAS ✓' : 'HAY ERRORES EN LAS FÓRMULAS ✗'}\n`);

// Validar función inversa (experiencia -> nivel)
console.log('2. Validando cálculo de nivel desde experiencia:');
for (const data of expectedData) {
  const calculatedLevel = calculateLevelFromExperience(data.experience);
  const isCorrect = calculatedLevel === data.level;
  console.log(`Exp ${data.experience}: Esperado nivel ${data.level}, Calculado nivel ${calculatedLevel} ${isCorrect ? '✓' : '✗'}`);
  if (!isCorrect) allCorrect = false;
}

// Validar progresión entre niveles
console.log('\n3. Validando progresión entre niveles:');
for (let level = 1; level < 10; level++) {
  const currentExp = calculateExperienceForLevel(level);
  const nextExp = calculateExperienceForLevel(level + 1);
  const expToNext = getExperienceToNextLevel(level);
  const actualDiff = nextExp - currentExp;
  const isCorrect = expToNext === actualDiff;
  console.log(`Nivel ${level}→${level + 1}: Necesita ${expToNext} exp, Diferencia real ${actualDiff} ${isCorrect ? '✓' : '✗'}`);
  if (!isCorrect) allCorrect = false;
}

// Simular algunos combates
console.log('\n4. Simulando combates:');
let experience = 0;
let level = 1;

console.log(`Inicio: Nivel ${level}, Experiencia ${experience}`);

// Simular 3 victorias
for (let i = 1; i <= 3; i++) {
  experience += calculateExperienceGain(true);
  const newLevel = calculateLevelFromExperience(experience);
  if (newLevel > level) {
    console.log(`Victoria ${i}: +2 exp → ${experience} total (¡SUBISTE AL NIVEL ${newLevel}!)`);
    level = newLevel;
  } else {
    console.log(`Victoria ${i}: +2 exp → ${experience} total (Nivel ${level})`);
  }
}

// Una derrota
experience += calculateExperienceGain(false);
const newLevel = calculateLevelFromExperience(experience);
if (newLevel > level) {
  console.log(`Derrota: +1 exp → ${experience} total (¡SUBISTE AL NIVEL ${newLevel}!)`);
  level = newLevel;
} else {
  console.log(`Derrota: +1 exp → ${experience} total (Nivel ${level})`);
}

console.log('\n5. Verificando que 5 exp = nivel 2:');
const fiveExpLevel = calculateLevelFromExperience(5);
console.log(`Con 5 exp: Nivel ${fiveExpLevel} ${fiveExpLevel === 2 ? '✓' : '✗'}`);

const fourExpLevel = calculateLevelFromExperience(4);
console.log(`Con 4 exp: Nivel ${fourExpLevel} ${fourExpLevel === 1 ? '✓' : '✗'}`);

console.log('\n=== VALIDACIÓN COMPLETADA ===');
if (allCorrect) {
  console.log('🎉 ¡Todo funciona correctamente! El sistema está listo para usar.');
} else {
  console.log('❌ Hay errores que necesitan ser corregidos.');
}
