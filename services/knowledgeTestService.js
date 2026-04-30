import Driver from '../models/Driver.js';

const questions = [
  {
    id: 1,
    question:
      'What is the maximum legal driving time before a truck driver must take a mandatory rest break?',
    options: ['A) 6 hours', 'B) 4.5 hours', 'C) 8 hours', 'D) 5 hours'],
    correct: 'B',
  },
  {
    id: 2,
    question:
      'When approaching a railroad crossing with no signals or barriers, what should a driver do?',
    options: [
      'A) Slow down and cross if no train is visible',
      'B) Stop only if carrying hazardous cargo',
      'C) Slow down, look both ways, and cross only when safe',
      'D) Sound the horn and proceed at normal speed',
    ],
    correct: 'C',
  },
  {
    id: 3,
    question: 'What does a yellow diamond-shaped road sign typically indicate?',
    options: [
      'A) A mandatory instruction (e.g., speed limit)',
      'B) A warning about a hazard or change in road conditions ahead',
      'C) The end of a restricted zone',
      'D) A service area nearby',
    ],
    correct: 'B',
  },
  {
    id: 4,
    question:
      'When securing cargo, what is the primary purpose of load securing?',
    options: [
      'A) To reduce fuel consumption',
      'B) To comply with insurance requirements only',
      'C) To make loading and unloading faster',
      'D) To prevent the load from shifting, falling, or causing accidents',
    ],
    correct: 'D',
  },
  {
    id: 5,
    question:
      'What should a driver check during a pre-trip vehicle inspection?',
    options: [
      'A) Only tire pressure and fuel level',
      'B) Only lights and mirrors',
      'C) Brakes, tires, lights, mirrors, fluid levels, and cargo securing',
      'D) Engine oil and windshield only',
    ],
    correct: 'C',
  },
  {
    id: 6,
    question:
      "If a truck's brakes overheat on a long downhill descent, what is the correct technique to prevent brake fade?",
    options: [
      'A) Apply the brakes firmly and continuously',
      'B) Switch to neutral gear to coast freely',
      'C) Use engine braking (lower gear) and apply brakes intermittently',
      'D) Increase speed to reduce brake load',
    ],
    correct: 'C',
  },
  {
    id: 7,
    question:
      'What is the safe following distance a truck driver should maintain on a dry road at highway speed?',
    options: [
      'A) 1 second per 10 km/h of speed',
      'B) At least 2 car lengths',
      'C) At least 4 seconds behind the vehicle ahead',
      'D) 10 meters at all times',
    ],
    correct: 'C',
  },
  {
    id: 8,
    question:
      'When transporting hazardous materials, which document must the driver carry at all times?',
    options: [
      'A) Vehicle registration only',
      'B) A general cargo manifest',
      "C) Driver's personal ID and employment contract",
      'D) A hazardous materials shipping document (dangerous goods declaration)',
    ],
    correct: 'D',
  },
];

const getQuestions = () => {
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));
};

const evaluateTest = async (driverId, answers) => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new Error('Driver not found');
  }

  let correctCount = 0;
  const results = [];

  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correct;
    if (isCorrect) correctCount++;
    results.push({
      questionId: q.id,
      userAnswer,
      correctAnswer: q.correct,
      isCorrect,
    });
  });

  const passed = correctCount >= 5;

  if (passed && !driver.knowledgeTestPassed) {
    driver.knowledgeTestPassed = true;
    await driver.save();
  }

  return {
    totalQuestions: questions.length,
    correctCount,
    passed,
    results,
  };
};

export { getQuestions, evaluateTest };
