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
  Q1: { text: "Is there visible hair loss?", yes: "Q2", no: "Q6", img: "dog1", hint: "Check if your pet has bald spots or if their fur is much thinner in specific areas." },
  Q2: { text: "Are the bald areas circular or ring-shaped?", yes: "Q3", no: "Q4", img: "dog2", hint: "Look for hair loss that forms a perfect or near-perfect circle, like a coin." },
  Q3: { text: "Are the patches scaly, flaky, or with red edges and pale center?", yes: "Q4a", no: "Q4b", img: "dog3", hint: "Check if the skin looks dry like dandruff or has a raised red border." },
  Q4a: { text: "Are other pets or humans affected?", yes: "RINGWORM", no: "FUNGAL INFECTION", img: "dog4", hint: "Has anyone else in the house (human or animal) started itching or developed red spots?" },
  Q4b: { text: "Is the skin flaky and spreading slowly?", yes: "FUNGAL INFECTION", no: "Q4", img: "dog5", hint: "Does it look like a dry patch of skin that is gradually getting larger?" },
  Q4: { text: "Is hair loss accompanied by intense itching or scratching?", yes: "Q5", no: "DEMODECTIC MANGE", img: "dog6", hint: "Is your pet constantly trying to scratch, bite, or rub that specific area?" },
  Q5: { text: "Is itching severe, worse at night, or affecting multiple animals?", yes: "SARCOPTIC MANGE", no: "Q6", img: "dog7", hint: "Mites are more active at night. Watch if the scratching becomes non-stop in the evening." },
  Q6: { text: "Is the pet frequently scratching, licking, or biting the skin?", yes: "Q7", no: "Q9", img: "dog8", hint: "Look for 'obsessive' grooming or your pet acting very restless because of their skin." },
  Q7: { text: "Did the symptoms start after food change, shampoo, or environmental exposure?", yes: "HYPERSENSITIVITY", no: "Q8", img: "dog9", hint: "Think back to any new items brought into the home or new brands of food/treats." },
  Q8: { text: "Is there redness, swelling, odor, discharge, pus, wet sores, or greasy skin?", yes: "DERMATITIS", no: "Q9", img: "dog10", hint: "Does the area smell 'musty' or look 'angry', wet, or oozing?" },
  Q9: { text: "Are lesions located on the face, ears, or paws?", yes: "Q10", no: "Q10", img: "dog11", hint: "Check the muzzle, the tips of the ears, and between the toes." },
  Q10: { text: "Are lesions located on the belly, chest, or legs?", yes: "Q11", no: "Q11", img: "dog12", hint: "Check the undersides of the pet where the skin is most sensitive." },
  Q11: { text: "Is there skin thickening or darkening in affected areas?", yes: "Q12", no: "Q12", img: "dog1", hint: "Does the skin feel tough like leather or look black/grey instead of pink?" },
  Q12: { text: "Is the skin dry, scaly, or flaky?", yes: "Q13", no: "Q13", img: "dog2", hint: "Look for white flakes that look like dandruff or hard crusts on the skin." },
  Q13: { text: "Are lesions spreading over time?", yes: "Q14", no: "Q14", img: "dog3", hint: "Compare the spot to how it looked yesterday—is it getting bigger?" },
  Q14: { text: "Has the pet been sick, weak, or immunocompromised recently?", yes: "Q15", no: "Q15", img: "dog4", hint: "A stressed or previously sick pet is more likely to develop skin issues." },
  Q15: { text: "Are symptoms seasonal or recurrent?", yes: "Q16", no: "Q16", img: "dog5", hint: "Does this happen every year during specific weather changes?" },
  Q16: { text: "Are other pets in the household showing similar skin problems?", yes: "Q17", no: "Q17", img: "dog6", hint: "Watch if the 'itch' is traveling from one animal to another." },
  Q17: { text: "Have humans in contact developed itchy or red skin spots?", yes: "FINISH", no: "FINISH", img: "dog7", hint: "This helps determine if the condition can jump to you (Zoonotic)." },
};

const SKIP_QUESTIONS_MAP: { [key: string]: string[] } = {
  "hairloss": ["Q1"],
  "hair loss": ["Q1"],
  "circular bald patches": ["Q1", "Q2"],
  "circular bald patch": ["Q1", "Q2"],
  "scaling": ["Q12"],
  "redness": ["Q8"],
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
    const winner = diagnosisMap[finalPath] || "No Skin Disease Present";
    const summary = Object.keys(allAnswers).filter(k => allAnswers[k] === 'yes').map(k => QUESTIONS[k].text);
    
    router.push({ 
      pathname: '/Screens/DiagnosisReportScreen' as any, 
      params: { condition: winner, summary: JSON.stringify(summary), imageUri, petName, petAge, petBreed, allResults } 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showExplanation} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowExplanation(false)}>
          <View style={styles.explanationBubble}>
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleTitle}>Simple Explanation</Text>
              <TouchableOpacity onPress={() => setShowExplanation(false)}>
                <Ionicons name="close-circle" size={24} color="#E89152" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bubbleText}>
                {autoDetected.length > 0 && `Based on the ${autoDetected.join(', ')} we detected, `}
                {QUESTIONS[questionId].hint}
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
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <View style={[styles.dot, styles.activeDot]}><Text style={styles.dotText}>{step}</Text></View>
                {step < 4 && <View style={[styles.line, styles.activeLine]} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.textHeader}>
            <Text style={styles.title}>Tell Us More</Text>
            {autoDetected.length > 0 && (
              <View style={styles.detectedBadgeContainer}>
                <Text style={styles.detectedTitle}>AI DETECTED:</Text>
                <View style={styles.badgeRow}>
                  {autoDetected.map((item, i) => (
                    <View key={i} style={styles.badge}>
                      <Ionicons name="checkmark-circle" size={12} color="#5CB85C" />
                      <Text style={styles.badgeText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.centerArea}>
          <Image source={DOCTOR_IMAGES[QUESTIONS[questionId]?.img || "dog1"]} style={styles.mascot} resizeMode="contain" />
          <View style={styles.card}>
            <Text style={styles.qText}>{QUESTIONS[questionId].text}</Text>
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
  title: { fontSize: 32, fontWeight: 'bold', color: '#E89152' },
  detectedBadgeContainer: { marginTop: 10, backgroundColor: '#F0F9F0', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#D0EED0' },
  detectedTitle: { fontSize: 9, fontWeight: '900', color: '#5CB85C', marginBottom: 5, letterSpacing: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  badgeText: { fontSize: 11, color: '#444', marginLeft: 4, fontWeight: '600', textTransform: 'capitalize' },
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