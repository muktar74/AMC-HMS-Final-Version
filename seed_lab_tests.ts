import pool from './server/db.js';

const labTests = [
    // Hematology
    { category: 'HEMATOLOGY', name: 'CBC' },
    { category: 'HEMATOLOGY', name: 'WBC' },
    { category: 'HEMATOLOGY', name: 'Diff N' },
    { category: 'HEMATOLOGY', name: 'Diff L' },
    { category: 'HEMATOLOGY', name: 'Diff E' },
    { category: 'HEMATOLOGY', name: 'Diff M' },
    { category: 'HEMATOLOGY', name: 'Diff B' },
    { category: 'HEMATOLOGY', name: 'Hgb' },
    { category: 'HEMATOLOGY', name: 'Hct' },
    { category: 'HEMATOLOGY', name: 'ESR' },
    { category: 'HEMATOLOGY', name: 'RBC' },
    { category: 'HEMATOLOGY', name: 'Platelet' },
    { category: 'HEMATOLOGY', name: 'Blood group & Rh' },
    { category: 'HEMATOLOGY', name: 'Blood Film' },
    { category: 'HEMATOLOGY', name: 'Peripheral Morphology' },

    // Parasitology
    { category: 'PARASITOLOGY', name: 'Consistency' },
    { category: 'PARASITOLOGY', name: 'O/P' },
    { category: 'PARASITOLOGY', name: 'Occult Blood' },
    { category: 'PARASITOLOGY', name: 'Urine' },
    { category: 'PARASITOLOGY', name: 'H.Pylori Stool Ag' },

    // Urinalysis
    { category: 'URINALYSIS', name: 'Color' },
    { category: 'URINALYSIS', name: 'Appearance' },
    { category: 'URINALYSIS', name: 'PH' },
    { category: 'URINALYSIS', name: 'SG' },
    { category: 'URINALYSIS', name: 'Leukocyte' },
    { category: 'URINALYSIS', name: 'Protein' },
    { category: 'URINALYSIS', name: 'Sugar' },
    { category: 'URINALYSIS', name: 'Ketone' },
    { category: 'URINALYSIS', name: 'Nitrite' },
    { category: 'URINALYSIS', name: 'Bilirubin' },
    { category: 'URINALYSIS', name: 'Urobolinogen' },
    { category: 'URINALYSIS', name: 'Blood' },

    // Microscopy
    { category: 'MICROSCOPY', name: 'Epith.cell' },
    { category: 'MICROSCOPY', name: 'WBC' },
    { category: 'MICROSCOPY', name: 'RBC' },
    { category: 'MICROSCOPY', name: 'Casts' },
    { category: 'MICROSCOPY', name: 'Bacteria' },

    // HCG test
    { category: 'HCG test', name: 'HCG test' },

    // Chemistry
    { category: 'CHEMISTRY', name: 'FBS/RBS' },
    { category: 'CHEMISTRY', name: 'SGOT' },
    { category: 'CHEMISTRY', name: 'SGPT' },
    { category: 'CHEMISTRY', name: 'Alk.Phos' },
    { category: 'CHEMISTRY', name: 'Bilirubin(T)' },
    { category: 'CHEMISTRY', name: 'Bilirubin(D)' },
    { category: 'CHEMISTRY', name: 'BUN/Urea' },
    { category: 'CHEMISTRY', name: 'Creatinine' },
    { category: 'CHEMISTRY', name: 'Uric acid' },
    { category: 'CHEMISTRY', name: 'T.Protein/Albumin' },
    { category: 'CHEMISTRY', name: 'Cholestor' },
    { category: 'CHEMISTRY', name: 'HDL' },
    { category: 'CHEMISTRY', name: 'LDL' },
    { category: 'CHEMISTRY', name: 'Triglyceride' },
    { category: 'CHEMISTRY', name: 'Sodium' },
    { category: 'CHEMISTRY', name: 'Potassium' },
    { category: 'CHEMISTRY', name: 'Calcium' },

    // Coagualaton Profile
    { category: 'COAGUALATON PROFILE', name: 'Bleeding time' },
    { category: 'COAGUALATON PROFILE', name: 'PT' },
    { category: 'COAGUALATON PROFILE', name: 'INR' },
    { category: 'COAGUALATON PROFILE', name: 'PTT' },

    // Serology
    { category: 'SEROLOGY', name: 'VDRL/RPR' },
    { category: 'SEROLOGY', name: 'Widal H' },
    { category: 'SEROLOGY', name: 'Widal O' },
    { category: 'SEROLOGY', name: 'Weil Felix' },
    { category: 'SEROLOGY', name: 'HBsAG' },
    { category: 'SEROLOGY', name: 'HCV Antibody' },
    { category: 'SEROLOGY', name: 'ASO Titer' },
    { category: 'SEROLOGY', name: 'CRP' },
    { category: 'SEROLOGY', name: 'H.Pylori Ab' },
    { category: 'SEROLOGY', name: 'Rheumatoid Factor' },
    { category: 'SEROLOGY', name: 'KOH' },
    { category: 'SEROLOGY', name: 'KHB Test' },

    // Bacteriology
    { category: 'BACTERIOLOGY', name: 'Gram\'s stain' },
    { category: 'BACTERIOLOGY', name: 'Wet Film' },
    { category: 'BACTERIOLOGY', name: 'AFB' },

    // Hormones
    { category: 'HORMONES', name: 'TFT' },
    { category: 'HORMONES', name: 'TSH' },
    { category: 'HORMONES', name: 'LH' },
    { category: 'HORMONES', name: 'Prolactin' },
];

async function seed() {
    console.log('Initializing tables...');
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS lab_tests (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                unit TEXT,
                reference_range TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(category, name)
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS lab_order_items (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                order_id UUID REFERENCES lab_orders(id) ON DELETE CASCADE,
                test_id UUID REFERENCES lab_tests(id),
                test_name TEXT,
                result TEXT,
                status TEXT DEFAULT 'pending',
                completed_at TIMESTAMPTZ
            );
        `);
    } catch (err: any) {
        console.error('Error creating tables:', err.message);
    }

    console.log('Seeding lab tests...');
    for (const test of labTests) {
        try {
            await pool.query(
                'INSERT INTO lab_tests (category, name) VALUES ($1, $2) ON CONFLICT (category, name) DO NOTHING',
                [test.category, test.name]
            );
        } catch (err: any) {
            console.error(`Error inserting ${test.name}:`, err.message);
        }
    }
    console.log('Seeding complete.');
    process.exit(0);
}

seed();
