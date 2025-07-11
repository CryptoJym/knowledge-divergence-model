const { chromium } = require('playwright');

async function verifyFixes() {
  console.log('✅ Verifying all fixes...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'networkidle' 
    });
    
    // Skip welcome
    await page.evaluate(() => {
      document.getElementById('welcomeSection').classList.add('hidden');
      document.getElementById('mainTabs').classList.remove('hidden');
      if (document.getElementById('tourOverlay')) document.getElementById('tourOverlay').style.display = 'none';
      if (document.getElementById('tourPopup')) document.getElementById('tourPopup').style.display = 'none';
    });
    
    // Test AI Speed Slider
    console.log('🎚️ AI Speed Slider Test:');
    await page.evaluate(() => showTab('see'));
    await page.waitForTimeout(1000);
    
    const sliderResults = [];
    for (const value of [10, 50, 100]) {
      await page.evaluate((val) => {
        document.getElementById('aiSpeedSlider').value = val;
        updateAISpeed();
      }, value);
      
      await page.waitForTimeout(500);
      
      const state = await page.evaluate(() => ({
        gap: document.getElementById('incomeGapDisplay').textContent
      }));
      
      sliderResults.push({ value, gap: state.gap });
      console.log(`  ${value}%: Gap = ${state.gap}`);
    }
    
    const uniqueGaps = [...new Set(sliderResults.map(r => r.gap))];
    console.log(`  Unique values: ${uniqueGaps.length} ${uniqueGaps.length > 1 ? '✅' : '❌'}`);
    
    // Test Future Scenarios
    console.log('\n🔮 Future Scenarios Test:');
    await page.evaluate(() => showTab('future'));
    await page.waitForTimeout(1000);
    
    const futureResults = [];
    for (const [ai, int] of [[10, 10], [90, 90]]) {
      await page.evaluate((vals) => {
        document.getElementById('futureAISlider').value = vals[0];
        document.getElementById('interventionSlider').value = vals[1];
        updateFutureScenario();
      }, [ai, int]);
      
      await page.waitForTimeout(500);
      
      const state = await page.evaluate(() => ({
        gap: document.getElementById('futureGapValue').textContent,
        mobility: document.getElementById('mobilityValue').textContent
      }));
      
      futureResults.push({ ai, int, gap: state.gap });
      console.log(`  AI=${ai}, Int=${int}: Gap = ${state.gap}, Mobility = ${state.mobility}`);
    }
    
    const uniqueFutureGaps = [...new Set(futureResults.map(r => r.gap))];
    console.log(`  Unique values: ${uniqueFutureGaps.length} ${uniqueFutureGaps.length > 1 ? '✅' : '❌'}`);
    
    // Check for NaN
    const hasNaN = await page.evaluate(() => {
      const elements = ['eliteIncome', 'massIncome', 'incomeGapDisplay', 
                       'futureGapValue', 'richIncome', 'poorIncome'];
      return elements.some(id => {
        const el = document.getElementById(id);
        return el && el.textContent.includes('NaN');
      });
    });
    
    console.log(`\n🔢 NaN Check: ${hasNaN ? '❌ FOUND' : '✅ CLEAN'}`);
    
    // Summary
    console.log('\n📊 FINAL STATUS:');
    console.log(`- AI Speed Slider: ${uniqueGaps.length > 1 ? '✅ Working' : '❌ Not working'}`);
    console.log(`- Future Scenarios: ${uniqueFutureGaps.length > 1 ? '✅ Working' : '❌ Not working'}`);
    console.log(`- NaN Errors: ${hasNaN ? '❌ Present' : '✅ Fixed'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n✅ Verification complete!');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

verifyFixes();