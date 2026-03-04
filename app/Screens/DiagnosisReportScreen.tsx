import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Image,
    Linking,
    Modal,
    Platform,
    SafeAreaView, ScrollView, StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';

const DISEASE_LIBRARY: any = {
  "RINGWORM": {
    description: "TECHNICAL: Dermatophytosis. A fungal infection of the keratinized structures (hair/claws).\n\nSIMPLE: This isn't a worm; it's a fungus that eats the protein in your pet's hair. It causes hair to break in circular patterns, leaving crusty, red 'rings' on the skin.",
    causes: "Contact with fungal spores from other animals, soil, or brushes. These 'invisible seeds' can live on furniture for over 18 months.",
    firstAid: "Wash your hands immediately. Isolate the pet in an easy-to-clean room (like a bathroom). Do not let children or elderly people touch the area as they can catch it easily.",
    urgency: "Highly Zoonotic (Spreads to humans). Requires a Wood's lamp exam or culture. Visit a vet within 24 hours.",
    isContagious: true,
    isUrgent: true 
  },
  "SARCOPTIC MANGE": {
    description: "TECHNICAL: Sarcoptic Acariasis. A severe inflammatory response to burrowing Sarcoptes mites.\n\nSIMPLE: Also known as 'Scabies.' Tiny microscopic bugs burrow tunnels under the skin to lay eggs. This causes an intense itch that leads to severe scratching and scabs.",
    causes: "Usually caught from wild animals (like foxes) or from other infected dogs in parks or shelters.",
    firstAid: "Apply an E-collar (cone) immediately to prevent self-mutilation. Isolate from other pets. Wash all bedding in hot water (60°C+).",
    urgency: "Highly Contagious. This is very painful and requires prescription medicine to kill the mites. See a vet immediately.",
    isContagious: true,
    isUrgent: true 
  },
  "DEMODECTIC MANGE": {
    description: "TECHNICAL: Demodicosis. An overproliferation of Demodex mites within hair follicles.\n\nSIMPLE: Most dogs have these mites naturally. However, if the immune system weakens, the mites multiply out of control, causing 'moth-eaten' hair loss around the eyes and mouth.",
    causes: "Not caught from others; it happens because the pet's own immune system cannot keep the natural mite population in check.",
    firstAid: "Focus on high-quality nutrition and low stress. Check skin daily for 'pimple-like' bumps or foul smells, which indicate secondary bacterial infection.",
    urgency: "Not Contagious. A vet must perform a skin scraping to count mites and provide medicine to boost skin health. Schedule a visit.",
    isContagious: false,
    isUrgent: true 
  },
  "FUNGAL INFECTION": {
    description: "TECHNICAL: Mycosis. Infection caused by fungi (yeasts, molds, or dermatophytes) in animals, including dogs.\n\nSIMPLE: This is an infection caused by yeast or molds infection. It makes skin feel greasy, look 'rusty' or red, and smell like corn chips or old socks. Usually found in moist areas like ears or toes.",
    causes: "Trapped moisture, humidity, or skin barrier damage caused by food or environmental allergies.",
    firstAid: "Keep the skin as dry as possible. Pat dry any skin folds with a clean towel. Avoid human soaps which can feed the yeast.",
    urgency: "Not Contagious. This is a comfort and hygiene issue. A vet visit this week is recommended for medicated antifungal treatment.",
    isContagious: false,
    isUrgent: false
  },
  "DERMATITIS": {
    description: "TECHNICAL: Pyotraumatic Dermatitis. Acute, self-induced skin trauma leading to surface pyoderma.\n\nSIMPLE: These are 'Hot Spots.' It starts with a tiny itch (like a flea bite) that the pet licks and bites until it becomes a large, wet, and painful sore—often in just hours.",
    causes: "Anything causing focal irritation: flea bites, matted fur, ear infections, or even boredom.",
    firstAid: "The 'Rule of Dry': Clip hair away so the sore can breathe. Clean with mild antiseptic. Use a cone immediately—if they lick it once, the healing starts over.",
    urgency: "Not Contagious. Hot spots grow very fast. If the sore is larger than a coin or oozing, see a vet for antibiotics.",
    isContagious: false,
    isUrgent: false
  },
  "HYPERSENSITIVITY": {
    description: "TECHNICAL: Type I Hypersensitivity/Urticaria. An immediate IgE-mediated allergic reaction.\n\nSIMPLE: A 'Flash Allergy.' Just like humans get hives from a bee sting, pets can react instantly to bugs, chemicals, vaccines, or new foods.",
    causes: "Insect venom (bee/spider), specific drugs, or strong household cleaning chemicals.",
    firstAid: "Apply a cool damp cloth to red areas. Watch breathing closely. If they seem sleepy, dizzy, or weak, they may be going into shock.",
    urgency: "Emergency Risk. If the face is swelling or the pet is wheezing/vomiting, go to the emergency vet immediately as the airway may block.",
    isContagious: false,
    isUrgent: true 
  },
  "NO SKIN DISEASE PRESENT": {
    description: "TECHNICAL: Healthy Integument. No primary or secondary lesions noted.\n\nSIMPLE: Your pet's skin looks great! The fur is thick, the skin color is normal, and there are no signs of uninvited guests like mites or fungi.",
    causes: "Consistent flea prevention, balanced nutrition, and a clean environment.",
    firstAid: "Maintain regular grooming. Use pH-balanced pet shampoos to keep the skin's natural protective layer strong.",
    urgency: "Everything looks healthy. No medical intervention required at this time.",
    isContagious: false,
    isUrgent: false
  }
};

const MASTER_GLOSSARY = [
  { term: "Alopecia", definition: "Partial or complete absence of hair from areas where it normally grows.", keywords: ["alopecia", "hair loss", "moth-eaten"] },
  { term: "Erythema", definition: "Superficial reddening of the skin, usually in patches, caused by injury or irritation.", keywords: ["erythema", "redness", "red", "rusty"] },
  { term: "Mycosis", definition: "A clinical condition caused by fungal infection of the skin.", keywords: ["mycosis", "ringworm", "fungus"] },
  { term: "Keratinized", definition: "Structures like hair and claws made of tough protein.", keywords: ["keratinized"] },
  { term: "Zoonotic", definition: "A disease that can be naturally transmitted from animals to humans.", keywords: ["zoonotic", "spreads to humans"] },
  { term: "Acariasis", definition: "A disease caused by an infestation of mites or ticks.", keywords: ["acariasis", "mites", "scabies"] },
  { term: "Sarcoptes", definition: "Microscopic mites that burrow into the skin causing intense itching.", keywords: ["sarcoptes"] },
  { term: "Demodicosis", definition: "Inflammatory skin disease caused by an overpopulation of Demodex mites.", keywords: ["demodicosis"] },
  { term: "Overproliferation", definition: "A rapid and excessive increase in the number of something.", keywords: ["overproliferation"] },
  { term: "Malassezia", definition: "A type of yeast that lives on the skin but can cause infection.", keywords: ["malassezia"] },
  { term: "Epidermal", definition: "Relating to the outer layer of the skin.", keywords: ["epidermal"] },
  { term: "Pyotraumatic", definition: "Skin damage caused by the animal's own scratching or biting.", keywords: ["pyotraumatic"] },
  { term: "Pyoderma", definition: "A bacterial skin infection characterized by pus and crusting.", keywords: ["pyoderma", "secondary bacterial infection", "oozing"] },
  { term: "Urticaria", definition: "A skin rash notable for pale red, raised, itchy bumps (Hives).", keywords: ["urticaria"] },
  { term: "IgE-mediated", definition: "An allergic reaction triggered by the immune system's antibodies.", keywords: ["ige-mediated"] },
  { term: "Integument", definition: "The natural outer covering of an organism, such as the skin.", keywords: ["integument"] },
  { term: "Lesions", definition: "An area of abnormal tissue, such as a sore, rash, or wound.", keywords: ["lesions"] }
];

export default function DiagnosisReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  const [searchRadius, setSearchRadius] = useState(10); 
  const [clinicType, setClinicType] = useState('General');

  const { condition, imageUri, summary, petName, petAge, petBreed, allResults } = useLocalSearchParams<any>();

  const currentCondition = (condition as string) || "NO SKIN DISEASE PRESENT";
  const details = DISEASE_LIBRARY[currentCondition.toUpperCase()] || DISEASE_LIBRARY["NO SKIN DISEASE PRESENT"];
  const isHealthy = currentCondition.toUpperCase() === "NO SKIN DISEASE PRESENT";

  // Results mapped from Backend Scan
  const resultsArray = useMemo(() => {
    try { 
        const parsed = allResults ? JSON.parse(allResults as string) : []; 
        return parsed.map((item: any) => ({
            name: item.label,
            score: item.percentage
        }));
    } catch (e) { 
        return []; 
    }
  }, [allResults]);

  const relevantGlossary = useMemo(() => {
    const combinedText = (details.description + " " + (details.urgency || "")).toLowerCase();
    return MASTER_GLOSSARY.filter(item => 
      item.keywords.some(keyword => combinedText.includes(keyword.toLowerCase()))
    );
  }, [details]);

  const monitoringChecklist = [
    { id: '1', label: 'Lesion becomes larger' },
    { id: '2', label: 'Redness worsens' },
    { id: '3', label: 'Hair loss spreads' },
    { id: '4', label: 'Skin becomes moist or oozing' },
    { id: '5', label: 'Pet becomes very itchy or uncomfortable' },
  ];

  const vetStatus = useMemo(() => {
    const hour = new Date().getHours();
    const isOpen = hour >= 8 && hour < 19; 
    return {
      isOpen,
      status: isOpen ? "OPEN NOW" : "CLOSED",
      color: isOpen ? "#5CB85C" : "#D9534F",
      subtext: isOpen ? "Clinics are currently open." : "Only emergency vets available."
    };
  }, []);

  const triage = useMemo(() => {
    if (isHealthy) return { label: "ROUTINE MONITORING", color: "#5CB85C", icon: "shield-checkmark" };
    if (details.isUrgent) return { label: "URGENT CARE REQUIRED", color: "#D9534F", icon: "alert-circle" };
    return { label: "MONITOR & SCHEDULE VET", color: "#F7924A", icon: "time" };
  }, [isHealthy, details.isUrgent]);

  useEffect(() => {
    if (details.isContagious) setShowWarning(true);
  }, [currentCondition]);

  const symptomList = useMemo(() => {
    try { return summary ? JSON.parse(summary) : []; } catch (e) { return []; }
  }, [summary]);

  const findNearbyVet = () => {
    let typeQuery = clinicType === 'Dermatologist' ? 'Veterinary Dermatologist' : 'Veterinary Clinic';
    if (!vetStatus.isOpen) typeQuery = `24/7 Emergency ${typeQuery}`;
    const query = `${typeQuery} with 4 star rating within ${searchRadius}km`;
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    Linking.openURL(url!).catch(() => Alert.alert("Error", "Could not open Maps."));
  };

  const callVet = () => Linking.openURL(`tel:911`);

  const exportPDF = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri as string, { encoding: 'base64' });
      const imageSrc = `data:image/jpeg;base64,${base64Image}`;
      const symptomHtml = symptomList.map((s: string) => `<li>${s}</li>`).join('');
      
      const scanResultsHtml = resultsArray.map((res: any) => `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #444;">${res.name.toUpperCase()}</span>
            <span style="color: #F7924A;">${res.score}% Match</span>
          </div>
          <div style="width: 100%; background: #FFF2E9; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="width: ${res.score}%; background: #F7924A; height: 100%; border-radius: 5px;"></div>
          </div>
        </div>
      `).join('');

      const html = `
        <html>
        <head>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
            .header-container { text-align: center; border-bottom: 2px solid #F7924A; padding-bottom: 15px; margin-bottom: 20px; }
            .report-title { color: #F7924A; font-size: 28px; margin: 0; }
            .pet-meta { font-size: 12px; color: #777; margin-top: 5px; }
            .section-title { font-size: 16px; font-weight: bold; color: #8D5932; border-left: 4px solid #F7924A; padding-left: 10px; margin: 20px 0 10px 0; text-transform: uppercase; }
            .pet-photo { width: 220px; height: 220px; border-radius: 20px; border: 4px solid ${triage.color}; object-fit: cover; }
            .results-box { background: #F9FAFB; padding: 20px; border-radius: 15px; border: 1px solid #E5E7EB; }
            .footer { margin-top: 40px; border-top: 1px solid #EEE; padding-top: 20px; font-size: 10px; color: #AAA; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <h1 class="report-title">Furemedy Assessment Report</h1>
            <div class="pet-meta">Patient: <b>${petName || 'N/A'}</b> | Breed: <b>${petBreed || 'N/A'}</b> | Age: <b>${petAge || 'N/A'}</b></div>
          </div>
          
          <div style="display: flex; gap: 20px; margin-bottom: 25px;">
            <div style="flex: 1; text-align: center;">
              <img src="${imageSrc}" class="pet-photo" />
            </div>
            <div style="flex: 1.5;">
              <div class="section-title">Analysis Summary</div>
              <h2 style="color: ${triage.color}; margin-top: 5px;">${currentCondition}</h2>
              <div style="background: ${triage.color}15; color: ${triage.color}; padding: 8px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                ${triage.label}
              </div>
              <p style="font-size: 13px; margin-top: 10px;"><b>Clinical Status:</b> ${details.isContagious ? "Contagious Risk" : "Non-Contagious"}</p>
            </div>
          </div>

          <div class="section-title">AI Confidence Levels</div>
          <div class="results-box">
            ${scanResultsHtml || '<p>No data available</p>'}
          </div>

          <div class="section-title">Medical Details</div>
          <p><b>Description:</b> ${details.description.replace('TECHNICAL: ', '').replace('SIMPLE: ', '')}</p>
          <p><b>Possible Causes:</b> ${details.causes}</p>
          <p><b>Urgency & Care:</b> ${details.urgency || "Regular monitoring recommended."}</p>
          
          <div class="section-title">Symptoms Reported</div>
          <ul style="padding-left: 20px;">${symptomHtml || '<li>No specific symptoms selected</li>'}</ul>

          <div class="section-title">First Aid & Interim Care</div>
          <p>${details.firstAid}</p>

          <div class="footer">
            <p>Generated by Furemedy AI on ${new Date().toLocaleDateString()}.<br/>
            <b>IMPORTANT:</b> This report is an AI-assisted screening tool. It does not replace a physical examination or professional diagnosis from a licensed veterinarian.</p>
          </div>
        </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) { 
      Alert.alert("Export Failed", "There was an error generating your PDF report."); 
    } finally { 
      setLoading(false); 
    }
  };

  const renderDescription = () => {
    const parts = details.description.split('\n\n');
    return parts.map((part: string, index: number) => {
      const isTechnical = part.startsWith('TECHNICAL:');
      const cleanText = part.replace('TECHNICAL: ', '').replace('SIMPLE: ', '');
      return (
        <View key={index} style={[styles.descCard, isTechnical ? styles.technicalCard : styles.simpleCard]}>
          <Text style={[styles.descLabel, isTechnical ? styles.technicalLabel : styles.simpleLabel]}>
            {isTechnical ? "CLINICAL EVALUATION" : "EXPLANATION"}
          </Text>
          <Text style={styles.descBody}>{cleanText}</Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.warningOverlay}>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={50} color="#D9534F" />
            <Text style={styles.warningTitle}>Safety Warning</Text>
            <Text style={styles.warningDesc}>This condition is highly contagious. Wash hands and isolate {petName || 'your pet'}.</Text>
            <TouchableOpacity style={styles.warningBtn} onPress={() => setShowWarning(false)}>
              <Text style={styles.warningBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/Screens/StartScreen')}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Skin Analysis Report</Text>
          <TouchableOpacity onPress={exportPDF}><Ionicons name="download-outline" size={24} color={triage.color} /></TouchableOpacity>
        </View>

        <View style={styles.imageSection}>
          <Image source={{ uri: imageUri as string }} style={[styles.petImage, { borderColor: triage.color }]} />
          <View style={[styles.imageLabel, { backgroundColor: triage.color }]}>
            <Text style={styles.imageLabelText}>{isHealthy ? 'Healthy' : 'Scan Result'}</Text>
          </View>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.triageBadge, { backgroundColor: triage.color + '15' }]}>
               <Ionicons name={triage.icon as any} size={16} color={triage.color} />
               <Text style={[styles.triageBadgeText, { color: triage.color }]}>{triage.label}</Text>
            </View>

            <View style={[styles.contagiousBadge, { backgroundColor: details.isContagious ? '#D9534F15' : '#5CB85C15' }]}>
               <Ionicons className={details.isContagious ? "shield-outline" : "checkmark-shield-outline"} size={18} color={details.isContagious ? "#D9534F" : "#5CB85C"} />
               <Text style={[styles.contagiousBadgeText, { color: details.isContagious ? "#D9534F" : "#5CB85C" }]}>
                 {details.isContagious ? "CONTAGIOUS" : "NOT CONTAGIOUS"}
               </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Patient Information</Text>
          <Text style={styles.petNameText}>{petName || 'Unknown Pet'}</Text>
          
          <View style={styles.petDetailsRow}>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>BREED</Text><Text style={styles.detailValue}>{petBreed || 'N/A'}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>AGE</Text><Text style={styles.detailValue}>{petAge || 'N/A'}</Text></View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>Findings</Text>
          <Text style={[styles.conditionName, { color: triage.color }]}>{currentCondition}</Text>

          {!isHealthy && resultsArray.length > 0 && (
            <View style={styles.allResultsBox}>
              <Text style={styles.smallSectionLabel}>AI Model Confidence</Text>
              {resultsArray.map((res: any, index: number) => (
                <View key={index} style={styles.resultRow}>
                  <View style={styles.resultInfo}><Text style={styles.resultNameText}>{res.name.toUpperCase()}</Text><Text style={styles.resultScoreText}>{res.score}% Match</Text></View>
                  <View style={styles.barContainer}><View style={[styles.barFill, { width: `${res.score}%`, backgroundColor: index === 0 ? triage.color : '#D1D1D1' }]} /></View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.explanationContainer}>
            {renderDescription()}
          </View>

          {!isHealthy && (
            <View style={styles.checklistSection}>
              <Text style={styles.checklistTitle}>Proactive Monitoring</Text>
              <Text style={styles.checklistSubtitle}>Please observe for the following developments:</Text>
              {monitoringChecklist.map((item) => (
                <View key={item.id} style={styles.checkboxRow}>
                  <Ionicons name="radio-button-on" size={12} color="#F7924A" style={{marginRight: 10}} />
                  <Text style={styles.checkboxLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoContentArea}>
             <View style={styles.infoRow}>
                <View style={styles.iconContainer}><Ionicons name="help-circle" size={18} color="#F7924A" /></View>
                <View style={{flex: 1}}><Text style={styles.infoLabel}>POSSIBLE CAUSE</Text><Text style={styles.infoValueText}>{details.causes}</Text></View>
             </View>

             {details.isUrgent ? (
               <View style={styles.infoRow}>
                  <View style={[styles.iconContainer, {backgroundColor: triage.color + '15'}]}><Ionicons name="medical" size={18} color={triage.color} /></View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.infoLabel, {color: triage.color}]}>VET RECOMMENDATION</Text>
                    <Text style={styles.infoValueText}>{details.urgency}</Text>
                    <View style={styles.statusPill}>
                      <View style={[styles.statusDot, { backgroundColor: vetStatus.color }]} />
                      <Text style={styles.statusText}>{vetStatus.status}: {vetStatus.subtext}</Text>
                    </View>

                    <View style={styles.filterBox}>
                      <Text style={styles.filterTitle}>Radius & Specialist Filters</Text>
                      <View style={styles.toggleRow}>
                        {[5, 10, 20].map((r) => (
                          <TouchableOpacity key={r} onPress={() => setSearchRadius(r)} style={[styles.toggleBtn, searchRadius === r && {backgroundColor: triage.color}]}>
                            <Text style={[styles.toggleBtnText, searchRadius === r && {color: 'white'}]}>{r}km</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.toggleRow}>
                        {['General', 'Dermatologist'].map((t) => (
                          <TouchableOpacity key={t} onPress={() => setClinicType(t)} style={[styles.toggleBtn, clinicType === t && {backgroundColor: triage.color}]}>
                            <Text style={[styles.toggleBtnText, clinicType === t && {color: 'white'}]}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.vetLocatorBtn, {backgroundColor: triage.color}]} onPress={findNearbyVet}>
                          <Ionicons name="location" size={14} color="white" />
                          <Text style={styles.vetLocatorText}>Find Vet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.callBtn, {borderColor: triage.color}]} onPress={callVet}>
                          <Ionicons name="call" size={14} color={triage.color} />
                          <Text style={[styles.callBtnText, {color: triage.color}]}>Call</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
               </View>
             ) : (
               <View style={styles.infoRow}>
                  <View style={[styles.iconContainer, {backgroundColor: '#5CB85C15'}]}><Ionicons name="bulb-outline" size={18} color="#5CB85C" /></View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.infoLabel, {color: '#5CB85C'}]}>CARE PLAN</Text>
                    <Text style={styles.infoValueText}>Monitor for 3-5 days then reassess.</Text>
                  </View>
               </View>
             )}

             <View style={styles.infoRow}>
                <View style={styles.iconContainer}><Ionicons name="bandage" size={18} color="#F7924A" /></View>
                <View style={{flex: 1}}><Text style={styles.infoLabel}>FIRST AID ACTIONS</Text><Text style={styles.infoValueText}>{details.firstAid}</Text></View>
             </View>
          </View>
          
          <View style={styles.divider} />
          <Text style={styles.subHeading}>Symptom Findings</Text>
          {symptomList.map((item: string, index: number) => (
            <View key={index} style={styles.symptomRow}>
              <Ionicons name="checkmark-circle" size={18} color={isHealthy ? "#5CB85C" : "#F7924A"} /><Text style={styles.symptomText}>{item}</Text>
            </View>
          ))}

          {relevantGlossary.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.glossaryContainer}>
                <Text style={styles.glossaryHeader}>Medical Glossary</Text>
                {relevantGlossary.map((item, index) => (
                  <View key={index} style={styles.glossaryItem}>
                    <Text style={styles.glossaryTerm}>{item.term}:</Text>
                    <Text style={styles.glossaryDef}>{item.definition}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.bottomActionArea}>
          <TouchableOpacity style={[styles.mainExportBtn, { backgroundColor: triage.color }]} onPress={exportPDF} disabled={loading}>
            <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />
            <Text style={styles.mainExportBtnText}>{loading ? "Generating..." : "Generate PDF Report"}</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>Share this detailed assessment with your veterinarian.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  imageSection: { alignItems: 'center', marginVertical: 20 },
  petImage: { width: 220, height: 220, borderRadius: 25, borderWidth: 6 },
  imageLabel: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: -15 },
  imageLabelText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  reportCard: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 25, padding: 25, elevation: 4 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  triageBadge: { flexDirection: 'row', padding: 8, borderRadius: 8, alignItems: 'center' },
  triageBadgeText: { fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
  contagiousBadge: { flexDirection: 'row', padding: 8, borderRadius: 8, alignItems: 'center' },
  contagiousBadgeText: { fontSize: 10, fontWeight: 'bold', marginLeft: 6 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#999', textTransform: 'uppercase' },
  petNameText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  petDetailsRow: { flexDirection: 'row', marginTop: 12 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: '#AAA', fontWeight: 'bold' },
  detailValue: { fontSize: 14, color: '#555', fontWeight: '600' },
  conditionName: { fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
  explanationContainer: { marginVertical: 10 },
  descCard: { padding: 15, borderRadius: 12, marginBottom: 10 },
  technicalCard: { backgroundColor: '#F0F4F8', borderLeftWidth: 4, borderLeftColor: '#2C3E50' },
  simpleCard: { backgroundColor: '#FFF9F5', borderLeftWidth: 4, borderLeftColor: '#F7924A' },
  descLabel: { fontSize: 10, fontWeight: '900', marginBottom: 4, letterSpacing: 0.5 },
  technicalLabel: { color: '#2C3E50' },
  simpleLabel: { color: '#F7924A' },
  descBody: { fontSize: 14, color: '#444', lineHeight: 20 },
  allResultsBox: { marginTop: 5, backgroundColor: '#FAFAFA', padding: 15, borderRadius: 15, marginBottom: 15 },
  smallSectionLabel: { fontSize: 10, fontWeight: 'bold', color: '#AAA', marginBottom: 10, textTransform: 'uppercase' },
  resultRow: { marginBottom: 12 },
  resultInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resultNameText: { fontSize: 13, fontWeight: 'bold', color: '#444' },
  resultScoreText: { fontSize: 11, color: '#999' },
  barContainer: { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  infoContentArea: { marginTop: 5 },
  infoRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' },
  iconContainer: { backgroundColor: '#FFF9F5', padding: 8, borderRadius: 10, marginRight: 12 },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#999' },
  infoValueText: { fontSize: 13, color: '#444', lineHeight: 18 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', padding: 6, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  filterBox: { marginTop: 15, backgroundColor: '#F9F9F9', padding: 12, borderRadius: 15 },
  filterTitle: { fontSize: 10, fontWeight: 'bold', color: '#999', marginBottom: 8 },
  toggleRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  toggleBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', backgroundColor: 'white' },
  toggleBtnText: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  actionRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  vetLocatorBtn: { flex: 2, flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  vetLocatorText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  callBtn: { flex: 1, flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  callBtnText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  subHeading: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 10 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  symptomText: { marginLeft: 10, fontSize: 14, color: '#666', flex: 1 },
  warningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  warningCard: { backgroundColor: 'white', borderRadius: 25, padding: 30, alignItems: 'center', width: '100%' },
  warningTitle: { fontSize: 22, fontWeight: 'bold', color: '#D9534F', marginTop: 15 },
  warningDesc: { fontSize: 15, color: '#666', textAlign: 'center', marginVertical: 15 },
  warningBtn: { backgroundColor: '#D9534F', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 20 },
  warningBtnText: { color: 'white', fontWeight: 'bold' },
  bottomActionArea: { paddingHorizontal: 20, marginVertical: 30, alignItems: 'center' },
  mainExportBtn: { flexDirection: 'row', width: '100%', padding: 18, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  mainExportBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  footerNote: { fontSize: 12, color: '#999', marginTop: 10, textAlign: 'center' },
  checklistSection: { marginTop: 10, backgroundColor: '#FFF9F5', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#F7924A20', marginBottom: 15 },
  checklistTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  checklistSubtitle: { fontSize: 12, color: '#666', marginBottom: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkboxLabel: { fontSize: 14, color: '#444', flex: 1 },
  glossaryContainer: { marginTop: 20, padding: 15, backgroundColor: '#F8F9FA', borderRadius: 15 },
  glossaryHeader: { fontSize: 12, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  glossaryItem: { marginBottom: 10 },
  glossaryTerm: { fontSize: 13, fontWeight: 'bold', color: '#F7924A' },
  glossaryDef: { fontSize: 12, color: '#666', lineHeight: 16 },
});