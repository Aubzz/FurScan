import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const DOCTOR_IMAGES: any = {
  dog1: require('../../assets/images/doctor_1.png'),
  dog2: require('../../assets/images/doctor_2.png'),
  dog3: require('../../assets/images/doctor_3.png'),
  dog4: require('../../assets/images/doctor_4.png'),
  dog5: require('../../assets/images/doctor_5.png'),
  dog6: require('../../assets/images/doctor_6.png'),
  dog7: require('../../assets/images/doctor_7.png'),
  dog8: require('../../assets/images/doctor_8.png'),
  dog9: require('../../assets/images/doctor_9.png'),
  dog10: require('../../assets/images/doctor_10.png'),
  dog11: require('../../assets/images/doctor_11.png'),
  dog12: require('../../assets/images/doctor_12.png'),
};

const QUESTIONS: any = {
  Q1: { text: "Is there visible hair loss or thinning fur?", yes: "Q2", no: "Q6", img: "dog1", hint: "Check if the skin is visible through the coat or if there are completely bald patches." },
  Q2: { text: "Are the bald areas circular or ring-shaped?", yes: "Q3", no: "Q4", img: "dog2", hint: "Look for hair loss that forms a distinct circle, like a coin or a target." },
  Q3: { text: "Are the patches scaly, crusty, or with red edges?", yes: "Q3a", no: "Q4b", img: "dog3", hint: "Check if the skin looks like it's peeling or has a raised, red outer border." },
  Q3a: { text: "Are other pets or humans in the house showing red, itchy skin spots?", yes: "RINGWORM", no: "Q4b", img: "dog4", hint: "Ringworm is contagious; check if anyone else has developed circular rashes." },
  Q4b: { text: "Is the skin surface flaking or the patch spreading slowly?", yes: "FUNGAL INFECTION", no: "Q4", img: "dog5", hint: "Look for white flakes (like dandruff) that seem to stay within the bald area." },
  Q4: { text: "Is the hair loss paired with frequent scratching or biting?", yes: "Q5", no: "DEMODECTIC MANGE", img: "dog6", hint: "Demodectic mange often causes hair loss without the pet appearing 'itchy' at first." },
  Q5: { text: "Is the scratching significantly more intense during the night?", yes: "SARCOPTIC MANGE", no: "Q6", img: "dog7", hint: "Sarcoptic mites are often more active at night, causing the pet to wake up to scratch." },
  Q6: { text: "Is the pet frequently scratching, licking, or chewing their skin?", yes: "Q7", no: "Q9", img: "dog8", hint: "Look for 'obsessive' grooming or your pet acting restless/unable to stay still." },
  Q7: { text: "Did the scratching start after a change in food, shampoo, or environment?", yes: "HYPERSENSITIVITY", no: "Q8", img: "dog9", hint: "Think back to new laundry detergents, lawn treatments, or a new bag of kibble." },
  Q7a: { text: "Does the pet specifically chew their paws or rub their face on the floor?", yes: "HYPERSENSITIVITY", no: "Q8", img: "dog10", hint: "Paws and face rubbing are classic visible signs of environmental or food sensitivities." },
  Q8: { text: "Is the skin red, swollen, or warm to the touch?", yes: "Q8b", no: "Q9", img: "dog11", hint: "Gently touch the skin; inflamed areas often feel warmer than the rest of the pet's body." },
  Q8b: { text: "Is there any pus, oozing, or a 'musty' odor?", yes: "DERMATITIS", no: "Q9", img: "dog12", hint: "Check for wet sores or a smell that persists even after a bath." },
  Q9: { text: "Are the spots mainly on the face, ears, or paws?", yes: "Q10", no: "Q11", img: "dog1", hint: "Mange and allergies often start on the extremities and the muzzle." },
  Q10: { text: "Are there small red bumps or pimples visible on the belly or chest?", yes: "Q11", no: "Q11", img: "dog2", hint: "Look for 'pustules'—tiny raised white or red bumps on the stomach." },
  Q11: { text: "Does the skin feel thickened, leathery, or has it turned black/grey?", yes: "Q12", no: "Q13", img: "dog3", hint: "Chronic irritation causes skin to thicken like 'elephant skin' and change color." },
  Q12: { text: "Is the skin surface notably dry, scaly, or covered in hard crusts?", yes: "Q13", no: "Q13", img: "dog4", hint: "Check for a 'sandpaper' texture or thick yellow/brown crusts on the skin." },
  Q13: { text: "Are the affected areas getting larger or appearing on new parts of the body?", yes: "Q14", no: "Q14", img: "dog5", hint: "Note if a small spot on a leg has moved to the chest or back over the last few days." },
  Q14: { text: "Is the pet currently on a regular flea and parasite preventative?", yes: "Q15", no: "Q15", img: "dog6", hint: "This helps rule out flea bites vs. clinical hypersensitivity or mange." },
  Q15: { text: "Are these skin changes happening for the first time?", yes: "Q16", no: "Q16", img: "dog7", hint: "Consider if this is a new issue or something that returns every year." },
  Q16: { text: "Has the pet recently been in contact with stray animals or a boarding kennel?", yes: "FINISH", no: "FINISH", img: "dog8", hint: "Exposure to other animals increases the likelihood of Mange or Ringworm." },
};

const SKIP_QUESTIONS_MAP: { [key: string]: string[] } = {
  "hairloss": ["Q1"],
  "hair loss": ["Q1"],
  "circular bald patches": ["Q1", "Q2"],
  "redness": ["Q8"],
  "inflammation": ["Q8"],
  "scaling": ["Q3", "Q12"],
  "crusting": ["Q3", "Q12"],
  "hyperpigmentation": ["Q11"],
};

export default function TellMeMoreScreen() {
  const router = useRouter();
  const { imageUri, aiPrediction, petName, petAge, petBreed, allResults } = useLocalSearchParams();
  
  const [questionId, setQuestionId] = useState("Q1");
  const [answers, setAnswers] = useState<any>({});
  const [history, setHistory] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [skipQuestionsSet, setSkipQuestionsSet] = useState<string[]>([]);
  const [autoDetected, setAutoDetected] = useState<string[]>([]);

  useEffect(() => {
    let skipSet: string[] = [];
    let initialAnswers: any = {};
    let detectedList: string[] = [];
    
    try {
      if (allResults) {
        const parsed = JSON.parse(allResults as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            const label = (item?.label || item?.name || "").toLowerCase().trim();
            if (SKIP_QUESTIONS_MAP[label]) {
              skipSet.push(...SKIP_QUESTIONS_MAP[label]);
              detectedList.push(label);
              SKIP_QUESTIONS_MAP[label].forEach(qId => { initialAnswers[qId] = 'yes'; });
            }
          });
        }
      }
    } catch (e) { console.error(e); }
    
    const uniqueSkips = [...new Set(skipSet)];
    setSkipQuestionsSet(uniqueSkips);
    setAutoDetected([...new Set(detectedList)]);
    setAnswers(initialAnswers);

    if (uniqueSkips.includes("Q1")) {
      setQuestionId(findNextNonSkipped("Q1", "yes", uniqueSkips));
    }
  }, [allResults]);

  const findNextNonSkipped = (currentId: string, answer: 'yes' | 'no', skips: string[]): string => {
    let nextId = QUESTIONS[currentId][answer];
    let safety = 0;
    while (skips.includes(nextId) && safety < 15) {
      const autoNext = QUESTIONS[nextId]?.yes; 
      if (!autoNext || !QUESTIONS[autoNext]) break;
      nextId = autoNext;
      safety++;
    }
    return nextId;
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setQuestionId(prev);
      setHistory(history.slice(0, -1));
    } else {
      router.back();
    }
  };

  const handleAnswer = (val: 'yes' | 'no') => {
    const updatedAnswers = { ...answers, [questionId]: val };
    setAnswers(updatedAnswers);
    
    const next = findNextNonSkipped(questionId, val, skipQuestionsSet);
    const isDiagnosis = ["RINGWORM", "FUNGAL INFECTION", "DEMODECTIC MANGE", "SARCOPTIC MANGE", "HYPERSENSITIVITY", "DERMATITIS"].includes(next);

    if (next === "FINISH" || isDiagnosis) {
      calculateResult(updatedAnswers, next);
    } else {
      setHistory([...history, questionId]);
      setQuestionId(next);
    }
  };

  const calculateResult = (allAnswers: any, finalPath: string) => {
    const diagnosisMap: any = { 
        "RINGWORM": "Ringworm", "FUNGAL INFECTION": "Fungal Infection", 
        "DEMODECTIC MANGE": "Demodectic Mange", "SARCOPTIC MANGE": "Sarcoptic Mange", 
        "HYPERSENSITIVITY": "Hypersensitivity", "DERMATITIS": "Dermatitis" 
    };

    // Weighted Fallback System
    const scores: any = {
      "Ringworm": (allAnswers.Q2 === 'yes' ? 2 : 0) + (allAnswers.Q3 === 'yes' ? 2 : 0) + (allAnswers.Q3a === 'yes' ? 3 : 0),
      "Fungal Infection": (allAnswers.Q4b === 'yes' ? 3 : 0) + (allAnswers.Q3 === 'yes' ? 1 : 0),
      "Demodectic Mange": (allAnswers.Q1 === 'yes' ? 1 : 0) + (allAnswers.Q4 === 'no' ? 3 : 0),
      "Sarcoptic Mange": (allAnswers.Q5 === 'yes' ? 4 : 0) + (allAnswers.Q4 === 'yes' ? 1 : 0),
      "Hypersensitivity": (allAnswers.Q7 === 'yes' ? 3 : 0) + (allAnswers.Q7a === 'yes' ? 3 : 0),
      "Dermatitis": (allAnswers.Q8 === 'yes' ? 2 : 0) + (allAnswers.Q8b === 'yes' ? 4 : 0)
    };

    const hasAnyYes = Object.values(allAnswers).includes('yes');
    const bestMatch = Object.entries(scores).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0];
    
    let winner = diagnosisMap[finalPath] || bestMatch;
    let confidence = hasAnyYes ? Math.min(Math.round(((scores[winner] || 1) / 7) * 100), 95) : 0;

    if (!hasAnyYes) {
        winner = "Inconclusive / Healthy Appearance";
        confidence = 0;
    }

    const summary = Object.keys(allAnswers)
      .filter(k => allAnswers[k] === 'yes' && QUESTIONS[k])
      .map(k => QUESTIONS[k].text);
    
    router.push({ 
      pathname: '/Screens/DiagnosisReportScreen' as any, 
      params: { 
        condition: winner, 
        confidence: confidence.toString(),
        summary: JSON.stringify(summary), 
        imageUri, petName, petAge, petBreed, allResults 
      } 
    });
  };

  // Determine which stepper dots to light up (progress bar)
  const currentStep = Math.min(Math.floor(history.length / 3) + 1, 4);

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showExplanation} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowExplanation(false)}>
          <View style={styles.explanationBubble}>
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleTitle}>Why we ask this</Text>
              <TouchableOpacity onPress={() => setShowExplanation(false)}>
                <Ionicons name="close-circle" size={24} color="#E89152" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bubbleText}>
                {autoDetected.length > 0 && `Based on the ${autoDetected.join(', ')} we detected, `}
                {QUESTIONS[questionId]?.hint}
            </Text>
            <TouchableOpacity style={styles.closeBtnSmall} onPress={() => setShowExplanation(false)}>
                <Text style={styles.closeBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.wrapper}>
        <View>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#E89152" />
          </TouchableOpacity>
          
          <View style={styles.stepper}>
            {[1, 2, 3, 4].map((step, idx) => (
              <React.Fragment key={step}>
                <View style={[styles.dot, idx <= currentStep && styles.activeDot]}>
                    <Text style={styles.dotText}>{step}</Text>
                </View>
                {step < 4 && <View style={[styles.line, idx < currentStep && styles.activeLine]} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.textHeader}>
            <Text style={styles.title}>Visual Assessment</Text>
          </View>
        </View>

        <View style={styles.centerArea}>
          <Image source={DOCTOR_IMAGES[QUESTIONS[questionId]?.img || "dog1"]} style={styles.mascot} resizeMode="contain" />
          <View style={styles.card}>
            <Text style={styles.qText}>{QUESTIONS[questionId]?.text}</Text>
            <TouchableOpacity style={styles.helpIconButton} onPress={() => setShowExplanation(true)}>
              <Ionicons name="help-circle-outline" size={24} color="#E89152" />
              <Text style={styles.helpIconText}>Explain this</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.choice} onPress={() => handleAnswer('yes')}>
            <Text style={styles.choiceText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.choice, styles.noBtn]} onPress={() => handleAnswer('no')}>
            <Text style={styles.choiceText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  wrapper: { flex: 1, paddingHorizontal: 25, justifyContent: 'space-between', paddingBottom: 20 },
  backBtn: { marginTop: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  dot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F2D9C7', justifyContent: 'center', alignItems: 'center' },
  activeDot: { backgroundColor: '#E89152' },
  dotText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  line: { width: 40, height: 3, backgroundColor: '#F2D9C7' },
  activeLine: { backgroundColor: '#E89152' },
  textHeader: { marginBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#E89152', textAlign: 'center' },
  centerArea: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  mascot: { width: 160, height: 160, marginBottom: -35, zIndex: 1 },
  card: { backgroundColor: '#FFF9F5', width: '100%', paddingVertical: 40, paddingHorizontal: 25, borderRadius: 35, borderWidth: 1, borderColor: '#F0E0D5', alignItems: 'center' },
  qText: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  helpIconButton: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 1 },
  helpIconText: { marginLeft: 5, color: '#E89152', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  explanationBubble: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 30, borderLeftWidth: 6, borderLeftColor: '#E89152', elevation: 10 },
  bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bubbleTitle: { fontSize: 14, fontWeight: 'bold', color: '#E89152', textTransform: 'uppercase' },
  bubbleText: { fontSize: 16, color: '#444', lineHeight: 22, marginBottom: 20 },
  closeBtnSmall: { backgroundColor: '#E89152', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 15 },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  choice: { backgroundColor: '#E89152', width: '47%', paddingVertical: 16, borderRadius: 25, alignItems: 'center' },
  noBtn: { backgroundColor: '#333' },
  choiceText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});