// Article data and interfaces for Insights screen

export interface ArticleSection {
  title: string;
  items: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleCard {
  id: string;
  title: string;
  description?: string;
  backgroundColor: string;
  icon?: string;
  gradientColors?: string[];
  contentType: 'article' | 'checklist' | 'guide' | 'video';
  intro: string;
  sections: ArticleSection[];
  relatedArticles?: string[];
  faq?: FAQItem[];
  videoUrl?: string;
}

export interface CategoryItem {
  icon: string;
  label: string;
  iconType: 'feather' | 'ionicons' | 'material';
}

// Color constants for articles
const Colors = {
  orangeCard1: '#FFF4ED',
  orangeCard2: '#FFE5D4',
  orangeCard3: '#FFD4B8',
  orangeCard4: '#FFC9A3',
};

// Categories data
export const categories: CategoryItem[] = [
  { icon: 'activity', label: 'Skin Conditions', iconType: 'feather' },
  { icon: 'shield-checkmark-outline', label: 'Prevention Tips', iconType: 'ionicons' },
  { icon: 'heart', label: 'Pet Care Basics', iconType: 'feather' },
  { icon: 'medical-outline', label: 'Purr & Paw Videos', iconType: 'ionicons' },
];

// Skin Health 101 articles
export const skinHealth101: ArticleCard[] = [
  {
    id: 'common-skin-diseases',
    title: 'Common Skin Diseases',
    description: 'Learn about mange, ringworm, and other common conditions affecting your furry friend',
    backgroundColor: Colors.orangeCard1,
    gradientColors: ['#FFF4ED', '#FFE5D4'],
    icon: 'bug-outline',
    contentType: 'article',
    intro: 'Understanding common skin diseases in pets is crucial for early detection and treatment. This guide covers the most frequent conditions you may encounter.',
    sections: [
      {
        title: 'Common Conditions',
        items: [
          'Mange: A parasitic skin disease caused by mites that leads to hair loss, intense itching, and skin irritation. There are two types: demodectic mange (usually in young dogs) and sarcoptic mange (highly contagious).',
          'Ringworm: Despite its name, this is a fungal infection that causes circular lesions, hair loss, and scaly patches. It\'s contagious to both pets and humans.',
          'Hot Spots: Acute moist dermatitis that appears as red, inflamed, and oozing sores. Often caused by allergies, insect bites, or excessive licking.',
          'Allergic Dermatitis: Reactions to food, environmental allergens (pollen, dust), or flea bites causing inflammation, redness, and discomfort.',
          'Yeast Infections: Overgrowth of yeast on the skin, especially in skin folds, causing a musty odor, redness, and greasy appearance.'
        ]
      },
      {
        title: 'Symptoms to Watch For',
        items: [
          'Excessive scratching or licking',
          'Hair loss or bald patches',
          'Redness and inflammation',
          'Unusual odor from the skin',
          'Bumps, lumps, or sores',
          'Changes in skin color or texture'
        ]
      },
      {
        title: 'When to See a Vet',
        items: [
          'If symptoms persist for more than a few days',
          'When your pet shows signs of severe discomfort',
          'If you notice open wounds or sores',
          'When symptoms are rapidly worsening',
          'If your pet shows systemic symptoms like fever or lethargy'
        ]
      },
      {
        title: 'Prevention Tips',
        items: [
          'Regular grooming and bathing',
          'Proper nutrition with essential fatty acids',
          'Flea and tick prevention',
          'Keeping your pet\'s environment clean',
          'Regular veterinary checkups'
        ]
      }
    ],
    relatedArticles: ['Early signs to watch', 'When to see a vet', 'Daily grooming tips'],
    faq: [
      {
        question: 'How can I tell if my pet has a skin disease?',
        answer: 'Look for signs like excessive scratching, hair loss, redness, bumps, or changes in skin color. If symptoms persist for more than a few days, consult your veterinarian.'
      },
      {
        question: 'Are skin diseases in pets contagious to humans?',
        answer: 'Some conditions like ringworm can be contagious to humans. Always wash your hands after handling a pet with skin issues and consult your vet for proper diagnosis and treatment.'
      },
      {
        question: 'Can I treat my pet\'s skin condition at home?',
        answer: 'Mild cases may improve with proper grooming and care, but persistent or severe symptoms require veterinary attention. Never use human medications without consulting your vet.'
      }
    ]
  },
  {
    id: 'early-signs-to-watch',
    title: 'Early Signs to Watch',
    description: 'Recognize symptoms before they become serious - early detection saves lives',
    backgroundColor: Colors.orangeCard2,
    gradientColors: ['#FFE5D4', '#FFD4B8'],
    icon: 'eye-outline',
    contentType: 'guide',
    intro: 'Early detection of skin problems can prevent serious complications. Learn to recognize the warning signs that indicate your pet may need attention.',
    sections: [
      {
        title: 'Physical Signs',
        items: [
          'Excessive Scratching or Licking: If your pet is constantly scratching, licking, or biting at their skin, this is often the first sign of a problem.',
          'Hair Loss: Patchy or widespread hair loss, especially if it appears suddenly, can indicate various skin conditions.',
          'Redness and Inflammation: Red, inflamed skin, particularly in specific areas, suggests irritation or infection.',
          'Bumps, Lumps, or Sores: Any unusual growths, bumps, or open sores should be examined by a veterinarian.',
          'Changes in Skin Color: Darkening or lightening of the skin, especially in areas of frequent scratching.',
          'Dry, Flaky Skin: Dandruff-like flakes or excessively dry skin can indicate underlying health issues.'
        ]
      },
      {
        title: 'Other Warning Signs',
        items: [
          'Unusual Odor: A foul or musty smell from your pet\'s skin can indicate bacterial or yeast infections.',
          'Behavioral Changes: Restlessness, loss of appetite, or lethargy combined with skin issues may indicate a more serious condition.',
          'Excessive Grooming: Your pet may be trying to soothe irritation by over-grooming certain areas.',
          'Avoiding Touch: If your pet flinches or avoids being touched in specific areas, they may be experiencing pain or discomfort.'
        ]
      }
    ],
    relatedArticles: ['Common skin diseases', 'When to see a vet'],
    faq: [
      {
        question: 'How often should I check my pet for skin issues?',
        answer: 'Perform a quick visual check during daily grooming. Look for any changes in skin appearance, unusual bumps, or signs of irritation. Regular checks help catch problems early.'
      },
      {
        question: 'What should I do if I notice early warning signs?',
        answer: 'Document the symptoms with photos, note when they started, and schedule a veterinary appointment. Early intervention often leads to better outcomes.'
      },
      {
        question: 'Can behavioral changes indicate skin problems?',
        answer: 'Yes, restlessness, excessive licking, or avoiding touch in certain areas can indicate discomfort or pain related to skin issues.'
      }
    ]
  },
  {
    id: 'when-to-see-vet',
    title: 'When to See a Vet',
    description: 'Know when professional help is needed for your pet\'s health',
    backgroundColor: Colors.orangeCard3,
    gradientColors: ['#FFD4B8', '#FFC9A3'],
    icon: 'medical-outline',
    contentType: 'guide',
    intro: 'Knowing when to seek professional veterinary care is essential for your pet\'s health. Some symptoms require immediate attention, while others can wait for a scheduled appointment.',
    sections: [
      {
        title: 'Schedule an Appointment',
        items: [
          'Persistent Symptoms: If skin issues persist for more than a few days despite home care, it\'s time to see a vet.',
          'Severe Itching: When your pet is so uncomfortable that it\'s affecting their quality of life or sleep.',
          'Hair Loss: Sudden or extensive hair loss should always be evaluated by a professional.',
          'Behavioral Changes: If your pet becomes aggressive, withdrawn, or shows significant behavioral changes due to discomfort.'
        ]
      },
      {
        title: 'Seek Immediate Care',
        items: [
          'Open Wounds or Sores: Any open wounds, especially those that are oozing, bleeding, or not healing, require immediate attention.',
          'Signs of Infection: Pus, foul odor, heat, or swelling around affected areas indicate possible infection.',
          'Rapid Worsening: If symptoms are getting worse quickly or spreading to other areas of the body.',
          'Systemic Symptoms: If your pet shows signs like fever, loss of appetite, lethargy, or vomiting along with skin issues.'
        ]
      }
    ],
    relatedArticles: ['Common skin diseases', 'Early signs to watch'],
    faq: [
      {
        question: 'When should I take my pet to an emergency vet?',
        answer: 'Seek immediate care for open wounds, signs of infection (pus, foul odor), rapid symptom worsening, or if your pet shows systemic symptoms like fever or lethargy.'
      },
      {
        question: 'How urgent are skin problems in pets?',
        answer: 'Most skin issues can wait for a scheduled appointment, but open wounds, infections, or rapidly worsening conditions require immediate veterinary attention.'
      },
      {
        question: 'What information should I bring to the vet?',
        answer: 'Bring photos of the affected areas, notes on when symptoms started, any recent changes in diet or environment, and a list of current medications or treatments.'
      }
    ]
  },
  {
    id: 'myth-vs-fact',
    title: 'Myth vs Fact: Skin Health',
    description: 'Separating common misconceptions from the truth about pet skin health',
    backgroundColor: Colors.orangeCard4,
    gradientColors: ['#FFC9A3', '#FFB380'],
    icon: 'help-circle-outline',
    contentType: 'article',
    intro: 'There are many myths and misconceptions about pet skin health. Let\'s separate fact from fiction to help you make informed decisions about your pet\'s care.',
    sections: [
      {
        title: 'Myth vs Fact',
        items: [
          'MYTH: If my pet has itchy, irritated skin, they must be allergic to something',
          'FACT: While allergies can cause some skin conditions in dogs and cats, parasites and autoimmune disorders are responsible for others. Our veterinary team has the tools to provide a diagnosis of the problem and develop a plan for treatment and prevention.',
          '',
          'MYTH: Outdoor pets are the only ones who get flea and tick bites',
          'FACT: These parasites don\'t care where your pet spends their time. They can easily invade your indoor living space on their own or hitch a ride with a cat, dog, or person coming in from outside. Signs that your pet is having an allergic reaction to flea or tick saliva include inflamed, dry, or irritated skin; frequent scratching; and hot spots. All pets need year-round prevention to protect them from fleas and ticks.',
          '',
          'MYTH: Pets\' hot spots don\'t do any harm and always heal on their own',
          'FACT: These areas of inflamed and infected skin, known as acute moist dermatitis, develop quickly and can lead to serious skin infections. If you see redness, swelling, or oozing lesions on your pet\'s skin, you need to take them to the veterinarian right away for treatment and management of the condition.',
          '',
          'MYTH: Dry skin in cats and dogs is nothing to worry about',
          'FACT: A little dryness may be normal, but extremely dry or flaky skin can point to an underlying issue such as allergies, improper nutrition, or environmental issues. Our veterinary team can help determine why your pet\'s skin is so dry and recommend treatment options that could include changing their diet, adding supplements, or soothing their irritated skin with medicated shampoos.',
          '',
          'MYTH: Bathing your pet frequently helps to alleviate skin problems',
          'FACT: Too much bathing can strip away the natural oils that keep pet\'s coats healthy. This can worsen irritation and dryness and lead to other skin issues. Your dog or cat doesn\'t need frequent baths unless a veterinarian recommends them to treat a particular problem.',
          '',
          'MYTH: You can safely use over-the-counter medications for people to treat your pets\' skin conditions',
          'FACT: Remedies intended for humans may do nothing at all for pets. Worse, they may be toxic to pets and cause serious adverse reactions. The only appropriate medications are treatments specially formulated for cats or dogs that are recommended by a veterinarian.',
          '',
          'MYTH: Coconut oil can cure any skin condition in pets',
          'FACT: Coconut oil can moisturize and temporarily relieve your pet\'s dry skin, but it\'s not a cure-all. How effective it is depends on the cause of the skin condition. Only a veterinarian is qualified to make a diagnosis and choose the best course of treatment.',
          '',
          'Reference: Homestead Animal Hospital. "Busting Myths About Skin Conditions in Pets." Retrieved from: https://thehomesteadanimalhospital.com/busting-myths-about-skin-conditions-in-pets/'
        ]
      },
      {
        title: 'Key Takeaways',
        items: [
          'Always consult your veterinarian for proper diagnosis and treatment',
          'Use products specifically designed for pets',
          'Early intervention leads to better outcomes',
          'Regular grooming and checkups help prevent and catch issues early',
          'Every pet is different - what works for one may not work for another'
        ]
      }
    ],
    relatedArticles: ['Common skin diseases', 'When to see a vet', 'Daily grooming tips'],
    faq: [
      {
        question: 'Do dogs really outgrow skin allergies?',
        answer: 'No, most skin allergies in dogs are lifelong conditions. However, they can be effectively managed with proper treatment, diet, and care under veterinary guidance.'
      },
      {
        question: 'Can I use human products on my pet?',
        answer: 'No, human products like shampoo, lotions, or medications are not safe for pets. They have different pH levels and ingredients that can cause serious skin irritation or toxicity.'
      },
      {
        question: 'How do I know if my pet\'s scratching is normal?',
        answer: 'Occasional scratching is normal, but excessive scratching, licking, or biting indicates a problem. If your pet is scratching enough to cause hair loss, redness, or sores, consult your veterinarian.'
      }
    ]
  },
];

// Prevention & Care articles
export const preventionCare: ArticleCard[] = [
  {
    id: 'daily-grooming-tips',
    title: 'Daily Grooming Tips',
    description: 'Keep your pet\'s skin healthy with proper care and attention',
    backgroundColor: Colors.orangeCard2,
    gradientColors: ['#FFE5D4', '#FFD4B8'],
    icon: 'brush-outline',
    contentType: 'checklist',
    intro: 'Regular grooming is essential for maintaining your pet\'s skin health. Follow this daily checklist to keep your furry friend healthy and happy.',
    sections: [
      {
        title: 'Daily Grooming Checklist',
        items: [
          'Brush your pet daily to remove dead hair, dirt, and distribute natural oils',
          'Check for fleas, ticks, or any unusual bumps or sores on the skin',
          'Inspect paw pads for cuts, cracks, or foreign objects',
          'Check ears for signs of infection or excessive wax',
          'Look for any changes in skin color, texture, or appearance',
          'Ensure nails are at appropriate length (trim weekly)',
          'Make grooming a positive experience with treats and praise'
        ]
      },
      {
        title: 'Best Practices',
        items: [
          'Use the right brush for your pet\'s coat type - consult your vet or groomer for recommendations',
          'Be gentle when brushing, especially around sensitive areas',
          'Use grooming as quality time with your pet, helping them become comfortable with being handled',
          'If you notice any abnormalities during grooming, document them and consult your veterinarian'
        ]
      }
    ],
    relatedArticles: ['Bathing best practices', 'Flea and tick prevention'],
    faq: [
      {
        question: 'How often should I groom my pet?',
        answer: 'Daily brushing is ideal for most pets. The frequency depends on your pet\'s coat type, but regular grooming helps maintain healthy skin and catch problems early.'
      },
      {
        question: 'What tools do I need for grooming?',
        answer: 'Use brushes appropriate for your pet\'s coat type. Consult your vet or groomer for specific recommendations. Always have treats on hand to make grooming positive.'
      },
      {
        question: 'Can grooming prevent skin problems?',
        answer: 'Yes, regular grooming removes dead hair, distributes natural oils, and helps you spot issues early. It also reduces the risk of matting and skin irritation.'
      }
    ]
  },
  {
    id: 'nutrition-skin-health',
    title: 'Nutrition and Skin Health',
    description: 'How diet affects your pet\'s skin condition and overall wellness',
    backgroundColor: Colors.orangeCard1,
    gradientColors: ['#FFF4ED', '#FFE5D4'],
    icon: 'medical-outline',
    contentType: 'article',
    intro: 'Proper nutrition plays a crucial role in maintaining healthy skin and coat. Learn how to feed your pet for optimal skin health.',
    sections: [
      {
        title: 'Essential Nutrients',
        items: [
          'High-Quality Protein: Ensure your pet gets adequate, high-quality protein sources which are essential for healthy skin and coat.',
          'Omega-3 Fatty Acids: Foods rich in omega-3s (fish oil, flaxseed) help reduce inflammation and promote healthy, shiny coats.',
          'Omega-6 Fatty Acids: These support skin barrier function. Look for foods containing sources like chicken fat or sunflower oil.',
          'Vitamins and Minerals: Vitamins A, E, and zinc are crucial for skin health. Most quality pet foods contain these.'
        ]
      },
      {
        title: 'Dietary Considerations',
        items: [
          'Avoid Food Allergies: Common allergens include beef, dairy, wheat, and chicken. If your pet has skin issues, consider an elimination diet.',
          'Hydration: Ensure your pet drinks plenty of water. Dehydration can lead to dry, flaky skin.',
          'Avoid Table Scraps: Human food can cause allergic reactions and nutritional imbalances affecting skin health.',
          'Consult Your Vet: If your pet has persistent skin issues, your vet may recommend a special diet or supplements.'
        ]
      }
    ],
    relatedArticles: ['Daily grooming tips', 'Seasonal care guide'],
    faq: [
      {
        question: 'What foods are best for healthy skin?',
        answer: 'Look for high-quality pet foods with adequate protein, omega-3 and omega-6 fatty acids, and essential vitamins like A, E, and zinc. Consult your vet for specific recommendations.'
      },
      {
        question: 'Can food allergies cause skin problems?',
        answer: 'Yes, food allergies are a common cause of skin issues. Common allergens include beef, dairy, wheat, and chicken. Your vet may recommend an elimination diet to identify triggers.'
      },
      {
        question: 'Should I give my pet supplements for skin health?',
        answer: 'Only under veterinary guidance. Omega-3 supplements can help, but always consult your vet before adding any supplements to your pet\'s diet.'
      }
    ]
  },
  {
    id: 'seasonal-care-guide',
    title: 'Seasonal Care Guide',
    description: 'Adapt your care routine throughout the year for optimal health',
    backgroundColor: Colors.orangeCard4,
    gradientColors: ['#FFC9A3', '#FFB380'],
    icon: 'calendar-outline',
    contentType: 'guide',
    intro: 'Your pet\'s skin care needs change with the seasons. This guide helps you adapt your routine throughout the year for optimal health.',
    sections: [
      {
        title: 'Spring Care',
        items: [
          'Increase flea and tick prevention as parasites become more active',
          'Start regular grooming to remove winter coat',
          'Be extra vigilant if your pet has environmental allergies',
          'Schedule a spring checkup with your veterinarian'
        ]
      },
      {
        title: 'Summer Care',
        items: [
          'Protect your pet from sunburn, especially on noses and ears',
          'Keep them cool and hydrated',
          'Watch for hot pavement that can burn paws',
          'Maintain regular grooming and parasite prevention'
        ]
      },
      {
        title: 'Fall Care',
        items: [
          'Continue parasite prevention',
          'As weather cools, some pets may develop dry skin - consider adding omega-3 supplements',
          'Be vigilant during peak allergy seasons',
          'Prepare for winter skin care changes'
        ]
      },
      {
        title: 'Winter Care',
        items: [
          'Cold, dry air can cause skin dryness - limit baths and use moisturizing shampoos',
          'Protect paws from ice and salt',
          'Use a humidifier to combat dry indoor air',
          'Maintain consistent grooming and nutrition'
        ]
      },
      {
        title: 'Year-Round',
        items: [
          'Maintain consistent grooming, nutrition, and parasite prevention regardless of season',
          'Schedule regular vet checkups to catch any skin issues early',
          'Monitor your pet\'s skin condition and adjust care as needed'
        ]
      }
    ],
    relatedArticles: ['Daily grooming tips', 'Nutrition and skin health'],
    faq: [
      {
        question: 'How do I adapt care for different seasons?',
        answer: 'Increase parasite prevention in spring/summer, protect from sun and heat in summer, watch for dry skin in fall/winter, and adjust grooming frequency based on weather conditions.'
      },
      {
        question: 'Do pets need different care in winter?',
        answer: 'Yes, cold and dry air can cause skin dryness. Limit baths, use moisturizing shampoos, protect paws from ice and salt, and consider using a humidifier indoors.'
      },
      {
        question: 'What about summer skin care?',
        answer: 'Protect your pet from sunburn, especially on noses and ears. Keep them cool and hydrated, and watch for hot pavement that can burn paw pads.'
      }
    ]
  },
];

// Pet Care Basics articles
export const petCareBasics: ArticleCard[] = [
  {
    id: 'bathing-best-practices',
    title: 'Bathing Best Practices',
    description: 'How often and how to bathe your pet safely without causing irritation',
    backgroundColor: Colors.orangeCard3,
    gradientColors: ['#FFD4B8', '#FFC9A3'],
    icon: 'water-outline',
    contentType: 'guide',
    intro: 'Proper bathing techniques are essential for maintaining your pet\'s skin health. Learn how to bathe your pet safely and effectively.',
    sections: [
      {
        title: 'Bathing Frequency',
        items: [
          'Most dogs need bathing every 4-6 weeks, but this varies by breed, activity level, and skin condition',
          'Over-bathing can strip natural oils and cause dryness',
          'Consult your veterinarian for breed-specific recommendations',
          'Some pets with skin conditions may need more frequent medicated baths'
        ]
      },
      {
        title: 'Preparation & Products',
        items: [
          'Use Pet-Specific Shampoo: Never use human shampoo. Choose pH-balanced, gentle formulas designed for pets',
          'Medicated shampoos may be recommended by your vet for specific conditions',
          'Have all supplies ready before starting: shampoo, towels, brush, and treats'
        ]
      },
      {
        title: 'Bathing Technique',
        items: [
          'Water Temperature: Use lukewarm water - not too hot or cold. Test on your wrist first',
          'Ear Protection: Place cotton balls in your pet\'s ears to prevent water from entering',
          'Gentle Technique: Massage shampoo in gently, avoiding the face and eyes. Use a washcloth for the face if needed',
          'Thorough Rinsing: Ensure all shampoo is completely rinsed out. Leftover residue can cause irritation and itching'
        ]
      },
      {
        title: 'After Bath Care',
        items: [
          'Drying: Towel dry thoroughly, then use a blow dryer on low heat if your pet tolerates it',
          'Ensure they\'re completely dry, especially in cold weather',
          'Post-Bath Care: Brush your pet after they\'re dry to prevent matting and distribute natural oils',
          'Reward your pet with treats to make bathing a positive experience'
        ]
      }
    ],
    relatedArticles: ['Daily grooming tips', 'Flea and tick prevention'],
    faq: [
      {
        question: 'How often should I bathe my pet?',
        answer: 'Most dogs need bathing every 4-6 weeks, but this varies by breed, activity level, and skin condition. Over-bathing can strip natural oils and cause dryness.'
      },
      {
        question: 'Can I use human shampoo on my pet?',
        answer: 'No, never use human shampoo. It\'s not pH-balanced for pets and can cause irritation. Always use pet-specific shampoos recommended by your veterinarian.'
      },
      {
        question: 'What if my pet hates baths?',
        answer: 'Make bathing positive with treats and praise. Use lukewarm water, be gentle, and consider professional grooming if your pet is very anxious about baths.'
      }
    ]
  },
  {
    id: 'flea-tick-prevention',
    title: 'Flea and Tick Prevention',
    description: 'Protect your pet from parasites with effective prevention methods',
    backgroundColor: Colors.orangeCard2,
    gradientColors: ['#FFE5D4', '#FFD4B8'],
    icon: 'shield-outline',
    contentType: 'guide',
    intro: 'Fleas and ticks can cause serious skin problems and transmit diseases. Effective prevention is key to keeping your pet healthy and comfortable.',
    sections: [
      {
        title: 'Prevention Methods',
        items: [
          'Year-Round Prevention: Use flea and tick prevention year-round, even in winter, as parasites can survive indoors',
          'Multiple Options: Choose from topical treatments, oral medications, collars, or sprays. Consult your vet for the best option for your pet',
          'Regular Application: Follow product instructions precisely. Most topical treatments are applied monthly, while some oral medications are given monthly or every 3 months',
          'Combination Approach: Some pets benefit from combining different prevention methods. Always consult your vet before combining products'
        ]
      },
      {
        title: 'Regular Monitoring',
        items: [
          'Check Regularly: Even with prevention, check your pet regularly for fleas and ticks, especially after outdoor activities',
          'Watch for Reactions: Monitor your pet after applying treatments. If you notice irritation, excessive scratching, or behavioral changes, contact your vet',
          'Look for signs: Excessive scratching, red bumps, or visible parasites'
        ]
      },
      {
        title: 'Environmental Control',
        items: [
          'Treat the Environment: Vacuum frequently, wash pet bedding, and consider treating your yard to eliminate flea and tick habitats',
          'Regular cleaning helps prevent reinfestation',
          'Consider professional pest control if infestation is severe'
        ]
      },
      {
        title: 'Tick Removal',
        items: [
          'If you find a tick, remove it immediately with tweezers, grasping close to the skin and pulling straight out',
          'Clean the area with antiseptic after removal',
          'Monitor the area for signs of infection or rash',
          'Consult your vet if you\'re concerned about tick-borne diseases'
        ]
      }
    ],
    relatedArticles: ['Daily grooming tips', 'Bathing best practices'],
    faq: [
      {
        question: 'Do I need flea and tick prevention year-round?',
        answer: 'Yes, even in winter. Parasites can survive indoors, and year-round prevention is the best way to protect your pet from diseases and skin problems.'
      },
      {
        question: 'What\'s the best flea and tick prevention method?',
        answer: 'The best method depends on your pet. Options include topical treatments, oral medications, collars, and sprays. Consult your veterinarian for the best option for your pet.'
      },
      {
        question: 'What should I do if I find a tick on my pet?',
        answer: 'Remove it immediately with tweezers, grasping close to the skin and pulling straight out. Clean the area with antiseptic and monitor for signs of infection or rash.'
      }
    ]
  },
  {
    id: 'grooming-dos-donts',
    title: 'Grooming Do\'s & Don\'ts',
    description: 'Essential guidelines for safe and effective pet grooming practices',
    backgroundColor: Colors.orangeCard1,
    gradientColors: ['#FFF4ED', '#FFE5D4'],
    icon: 'checkmark-circle-outline',
    contentType: 'guide',
    intro: 'Grooming your pet at home can be a rewarding experience that helps you bond with your furry friend while keeping them healthy. Done right, it prevents mats, skin issues, and discomfort. Done wrong, it can be stressful for both of you. Here\'s a guide to the key dos and don\'ts of home grooming.',
    sections: [
      {
        title: 'Do\'s',
        items: [
          'Do Know Your Pet\'s Needs: Every pet is different. Dogs and cats have different coat types, skin sensitivities, and grooming needs. Long-haired pets usually need more brushing to avoid tangles, while short-haired pets may only need occasional combing. Spend some time learning what works for your pet\'s breed or ask a professional for advice.',
          'Do Keep It Calm: Pets pick up on tension, so a calm environment is really important. Choose a quiet room, make sure you have good lighting, and have all your tools ready. Talking to your pet in a gentle voice can help, and treats are always a bonus. For cats, shorter sessions usually work best. Patience makes everything safer and easier.',
          'Do Use the Right Tools: The right tools make a huge difference. A slicker brush, comb, nail clippers, and pet-friendly shampoo are basics. Avoid human shampoo as it can irritate your pet\'s skin. Some pets benefit from specialized brushes or grooming gloves. Good tools make grooming faster and safer for both of you.',
          'Do Check for Health Issues: Grooming is a great chance to spot any problems early. Look for lumps, bumps, fleas, ticks, or irritated skin. Check behind ears, under collars, and between toes. Noticing changes early can prevent bigger issues down the road.',
          'Do Trim Nails Carefully: Long nails can be uncomfortable and even cause health problems. Use proper pet nail clippers and be very careful of the blood vessels inside the nails. If you\'re not sure, trim small bits at a time or ask your vet for tips. Some pets also benefit from occasional filing.',
          'Do Reward Your Pet: Positive reinforcement makes grooming something your pet can enjoy. Praise, gentle petting, and treats help them associate grooming with something good. Over time, they may even look forward to it.'
        ]
      },
      {
        title: 'Don\'ts',
        items: [
          'Don\'t Force Your Pet: Forcing a pet to stay still usually makes things worse. If your pet resists, pause and try again later. Introduce tools and steps slowly and reward cooperation with treats and praise.',
          'Don\'t Overbathe: Bathing too often can dry out your pet\'s skin. Most dogs are fine with a bath every few weeks, and cats even less. Spot cleaning and regular brushing can often replace full baths. Always rinse thoroughly to remove any shampoo residue.',
          'Don\'t Ignore Mats and Tangles: Mats are uncomfortable and can even cause skin issues. Don\'t pull on them. Use a pet-safe detangling spray or a mat splitter and work gently from the edges in. If a tangle is really bad, a professional groomer is the safer choice.',
          'Don\'t Forget Teeth and Ears: Grooming isn\'t just about fur. Regular brushing of teeth and checking ears is important too. Use pet-safe toothpaste and keep an eye out for wax build-up or bad smells. Taking care of these areas keeps your pet comfortable and healthy.',
          '',
          'Reference: PetGuide. "The Dos and Don\'ts of Pet Grooming at Home." Retrieved from: https://www.petguide.com/pets/the-dos-and-donts-of-pet-grooming-at-home-44633950'
        ]
      },
      {
        title: 'Best Practices',
        items: [
          'Establish a regular grooming routine that works for both you and your pet',
          'Use positive reinforcement to make grooming enjoyable',
          'Monitor your pet\'s skin condition and adjust grooming frequency as needed',
          'Keep grooming sessions short and positive, especially for anxious pets',
          'Invest in quality grooming tools appropriate for your pet\'s coat type'
        ]
      }
    ],
    relatedArticles: ['Daily grooming tips', 'Bathing best practices', 'Nutrition and skin health'],
    faq: [
      {
        question: 'How often should I groom my pet?',
        answer: 'Grooming frequency depends on your pet\'s breed, coat type, and lifestyle. Daily brushing is ideal for most pets, while bathing typically ranges from weekly to monthly. Consult your veterinarian for specific recommendations.'
      },
      {
        question: 'Can I use human grooming products on my pet?',
        answer: 'No, never use human products. They have different pH levels and ingredients that can cause skin irritation, dryness, or allergic reactions. Always use products specifically designed for pets.'
      },
      {
        question: 'What should I do if my pet hates being groomed?',
        answer: 'Make grooming positive with treats, praise, and short sessions. Start slowly, be patient, and consider professional grooming if needed. Never force grooming as it can create fear and stress.'
      }
    ]
  },
];

// Video Guides articles
export const videoGuides: ArticleCard[] = [
  {
    id: 'dog-skin-disease-overview',
    title: 'How To Recognize And Treat A Fungal Infection In Dogs',
    description: 'Learn how to identify and treat fungal infections in your dog with expert veterinary guidance',
    backgroundColor: Colors.orangeCard1,
    gradientColors: ['#FFF4ED', '#FFE5D4'],
    icon: 'shield-checkmark-outline',
    contentType: 'video',
    intro: 'Fungal infections are a common skin problem in dogs that can cause discomfort and health issues. This video guide will teach you how to recognize the signs of fungal infections, understand the different types, and learn proper treatment methods to help your furry friend recover.',
    sections: [
      {
        title: 'What You\'ll Learn',
        items: [
          'How to recognize the signs and symptoms of fungal infections in dogs',
          'Different types of fungal infections and their characteristics',
          'When to seek immediate veterinary care',
          'Treatment options including medications and home care',
          'Prevention strategies to protect your dog from fungal infections'
        ]
      },
      {
        title: 'Key Topics Covered',
        items: [
          'Ringworm: The most common fungal infection in dogs',
          'Yeast Infections: Understanding Malassezia and other yeast-related conditions',
          'Symptoms to Watch For: Hair loss, redness, itching, and skin lesions',
          'Diagnosis Methods: How veterinarians identify fungal infections',
          'Treatment Approaches: Topical and oral antifungal medications'
        ]
      }
    ],
    relatedArticles: ['Common skin diseases', 'Early signs to watch', 'When to see a vet'],
    videoUrl: 'https://www.youtube.com/embed/iyNGSHVy2cM',
    faq: [
      {
        question: 'How long is the video?',
        answer: 'The video is approximately 15-20 minutes long and covers all essential information about dog skin diseases in an easy-to-understand format.'
      },
      {
        question: 'Can I watch this on mobile?',
        answer: 'Yes, the video is fully optimized for mobile viewing and can be watched on any device.'
      },
      {
        question: 'Is this video suitable for beginners?',
        answer: 'Absolutely! The video is designed for pet owners of all experience levels and explains complex topics in simple terms.'
      }
    ]
  },
  {
    id: 'treating-dog-skin-infections',
    title: 'Dog Skin Care and Treatment Guide',
    description: 'Comprehensive guide to treating and managing skin conditions in dogs',
    backgroundColor: Colors.orangeCard2,
    gradientColors: ['#FFE5D4', '#FFD4B8'],
    icon: 'bandage-outline',
    contentType: 'video',
    intro: 'Proper skin care is essential for your dog\'s health and comfort. This video provides detailed guidance on identifying skin issues, understanding treatment options, and implementing effective care routines to keep your pet\'s skin healthy.',
    sections: [
      {
        title: 'Video Highlights',
        items: [
          'Safe cleaning techniques for infected areas',
          'Proper application of topical treatments',
          'When to stop home treatment and see a vet',
          'Preventing infection recurrence',
          'Monitoring your pet\'s recovery progress'
        ]
      },
      {
        title: 'Important Reminders',
        items: [
          'Never use human medications without veterinary approval',
          'Always complete the full course of treatment',
          'Monitor for signs of improvement or worsening',
          'Keep the affected area clean and dry',
          'Consult your vet if symptoms persist or worsen'
        ]
      }
    ],
    relatedArticles: ['Bathing best practices', 'Daily grooming tips', 'When to see a vet'],
    videoUrl: 'https://www.youtube.com/embed/gcSZfNPM2rg',
    faq: [
      {
        question: 'Can I treat all skin infections at home?',
        answer: 'No, only minor infections should be treated at home. If your dog has severe symptoms, open wounds, or the infection is spreading, consult your veterinarian immediately.'
      },
      {
        question: 'What supplies do I need?',
        answer: 'The video will show you exactly what supplies are needed, typically including gentle cleansers, prescribed topical treatments, and clean bandages if necessary.'
      }
    ]
  },
  {
    id: 'preventing-skin-problems',
    title: 'Dog Skin Disease Prevention and Management',
    description: 'Expert tips for preventing skin diseases and maintaining healthy skin in dogs',
    backgroundColor: Colors.orangeCard3,
    gradientColors: ['#FFD4B8', '#FFC9A3'],
    icon: 'heart-pulse-outline',
    contentType: 'video',
    intro: 'Preventing skin diseases is easier than treating them. This comprehensive video covers essential prevention strategies, early detection methods, and management techniques to help you keep your dog\'s skin healthy and problem-free.',
    sections: [
      {
        title: 'Prevention Strategies',
        items: [
          'Daily grooming routines and techniques',
          'Proper nutrition for healthy skin',
          'Environmental factors to consider',
          'Regular health checkups',
          'Early detection methods'
        ]
      },
      {
        title: 'Best Practices',
        items: [
          'Establish a consistent grooming schedule',
          'Choose the right products for your dog\'s skin type',
          'Maintain a clean living environment',
          'Monitor your dog\'s skin condition regularly',
          'Work with your veterinarian on a prevention plan'
        ]
      }
    ],
    relatedArticles: ['Daily grooming tips', 'Nutrition and skin health', 'Seasonal care guide'],
    videoUrl: 'https://www.youtube.com/embed/Htxlnv-y_Yg',
    faq: [
      {
        question: 'How often should I check my dog\'s skin?',
        answer: 'Perform a quick visual check during daily grooming. A more thorough examination should be done weekly, especially if your dog is prone to skin issues.'
      },
      {
        question: 'Can diet really prevent skin problems?',
        answer: 'Yes! Proper nutrition with essential fatty acids, vitamins, and minerals plays a crucial role in maintaining healthy skin and preventing many common conditions.'
      }
    ]
  },
];

// Helper function to get all articles
export const getAllArticles = (): ArticleCard[] => {
  return [...skinHealth101, ...preventionCare, ...petCareBasics, ...videoGuides];
};
