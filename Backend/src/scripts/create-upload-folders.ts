import { initializeFolderStructure } from '../utils/localFileStorage';

/**
 * Script to create the organized upload folder structure
 * Run this script once to create all necessary folders
 * 
 * Usage: npx ts-node src/scripts/create-upload-folders.ts
 */

async function main() {
  console.log('='.repeat(60));
  console.log('Creating Organized Upload Folder Structure');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    await initializeFolderStructure();
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Folder structure created successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📂 Structure created:');
    console.log('   uploads/');
    console.log('   ├── personal-photos/');
    console.log('   │   ├── members/');
    console.log('   │   ├── team-members/');
    console.log('   │   ├── staff/');
    console.log('   │   └── participants/');
    console.log('   ├── national-ids/');
    console.log('   │   ├── members/');
    console.log('   │   ├── team-members/');
    console.log('   │   ├── staff/');
    console.log('   │   └── participants/');
    console.log('   ├── medical-reports/');
    console.log('   │   ├── members/');
    console.log('   │   ├── team-members/');
    console.log('   │   ├── staff/');
    console.log('   │   └── participants/');
    console.log('   └── ... (7 more document types)');
    console.log('');
    console.log('Total: 40 folders (10 document types × 4 user types)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creating folder structure:', error);
    process.exit(1);
  }
}

main();
