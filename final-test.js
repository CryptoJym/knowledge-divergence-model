const { chromium } = require('playwright');
const fs = require('fs');

async function finalTest() {
  console.log('🏁 Final comprehensive test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
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
    
    // Test 1: AI Speed Slider Dynamic Range
    console.log('📊 Test 1: AI Speed Slider Dynamic Range');
    await page.evaluate(() => showTab('see'));
    await page.waitForTimeout(1000);
    
    results.tests.aiSpeedSlider = [];
    
    for (const value of [10, 25, 50, 75, 100]) {
      await page.evaluate((val) => {
        document.getElementById('aiSpeedSlider').value = val;
        updateAISpeed();
      }, value);
      
      await page.waitForTimeout(500);
      
      const state = await page.evaluate(() => ({
        elite: document.getElementById('eliteIncome').textContent,
        mass: document.getElementById('massIncome').textContent,
        gap: document.getElementById('incomeGapDisplay').textContent
      }));
      
      results.tests.aiSpeedSlider.push({ value, ...state });
      console.log(`  ${value}%: Elite=${state.elite}, Mass=${state.mass}, Gap=${state.gap}`);
    }
    
    // Check if values actually change
    const uniqueGaps = [...new Set(results.tests.aiSpeedSlider.map(r => r.gap))];
    console.log(`  Unique gap values: ${uniqueGaps.length}`);
    console.log(`  ✅ Dynamic range: ${uniqueGaps.length > 1 ? 'YES' : 'NO'}`);
    
    // Test 2: Future Scenarios Dynamic Range
    console.log('\n📊 Test 2: Future Scenarios Dynamic Range');
    await page.evaluate(() => showTab('future'));
    await page.waitForTimeout(1000);
    
    results.tests.futureScenarios = [];
    
    const scenarios = [
      { ai: 10, int: 10 },
      { ai: 50, int: 50 },
      { ai: 90, int: 10 },
      { ai: 10, int: 90 }
    ];
    
    for (const scenario of scenarios) {
      await page.evaluate((s) => {
        document.getElementById('futureAISlider').value = s.ai;
        document.getElementById('interventionSlider').value = s.int;
        updateFutureScenario();
      }, scenario);
      
      await page.waitForTimeout(500);
      
      const state = await page.evaluate(() => ({
        gap: document.getElementById('futureGapValue').textContent,
        rich: document.getElementById('richIncome').textContent,
        poor: document.getElementById('poorIncome').textContent,
        mobility: document.getElementById('mobilityValue').textContent
      }));
      
      results.tests.futureScenarios.push({ ...scenario, ...state });
      console.log(`  AI=${scenario.ai}, Int=${scenario.int}: Gap=${state.gap}, Mobility=${state.mobility}`);
    }
    
    // Test 3: Interactive Elements
    console.log('\n📊 Test 3: Interactive Elements');
    await page.evaluate(() => showTab('why'));
    await page.waitForTimeout(1000);
    
    // Test factor cards
    const factorCardTest = await page.evaluate(() => {
      const initialContent = document.getElementById('demoContent').textContent;
      
      // Click first factor card
      const firstCard = document.querySelector('.factor-card');
      if (firstCard) {
        firstCard.click();
        const newContent = document.getElementById('demoContent').textContent;
        return {
          success: true,
          changed: initialContent !== newContent,
          hasDemo: !newContent.includes('Click a factor')
        };
      }
      return { success: false };
    });
    
    console.log(`  Factor cards: ${factorCardTest.changed ? '✅ Interactive' : '❌ Not working'}`);
    results.tests.factorCards = factorCardTest;
    
    // Test 4: Reality Quiz
    console.log('\n📊 Test 4: Reality Quiz');
    await page.evaluate(() => showTab('reality'));
    await page.waitForTimeout(1000);
    
    const quizTest = await page.evaluate(() => {
      // Answer all questions
      const buttons = document.querySelectorAll('#realityQuiz button');
      if (buttons.length >= 6) {
        buttons[0].click(); // Yes to AI tools
        buttons[3].click(); // Yes to shipping
        buttons[4].click(); // No to AI hub
        
        const result = document.getElementById('realityResult');
        return {
          success: true,
          visible: result && result.style.display !== 'none',
          verdict: document.getElementById('realityVerdict')?.textContent || 'N/A'
        };
      }
      return { success: false };
    });
    
    console.log(`  Reality quiz: ${quizTest.visible ? '✅ Working' : '❌ Not working'}`);
    if (quizTest.visible) {
      console.log(`  Verdict: ${quizTest.verdict}`);
    }
    results.tests.realityQuiz = quizTest;
    
    // Test 5: 3D Visualization
    console.log('\n📊 Test 5: 3D Visualization');
    await page.evaluate(() => showTab('visualize3d'));
    await page.waitForTimeout(2000);
    
    const threeDTest = await page.evaluate(() => {
      const container = document.getElementById('three-container');
      const hasCanvas = container && container.querySelector('canvas') !== null;
      const year3d = document.getElementById('year3d')?.textContent;
      const gap3d = document.getElementById('gap3d')?.textContent;
      
      return {
        hasCanvas,
        year: year3d || 'N/A',
        gap: gap3d || 'N/A'
      };
    });
    
    console.log(`  3D Visualization: ${threeDTest.hasCanvas ? '✅ Rendered' : '❌ Not rendered'}`);
    results.tests.threeD = threeDTest;
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 SUMMARY');
    console.log('='.repeat(50));
    
    const issues = [];
    
    // Check for critical issues
    if (uniqueGaps.length <= 1) {
      issues.push('AI Speed slider not changing values dynamically');
    }
    
    if (!factorCardTest.changed) {
      issues.push('Factor cards not interactive');
    }
    
    if (!quizTest.visible) {
      issues.push('Reality quiz not working');
    }
    
    if (!threeDTest.hasCanvas) {
      issues.push('3D visualization not rendering');
    }
    
    // Check for NaN
    const hasNaN = JSON.stringify(results).includes('NaN');
    if (hasNaN) {
      issues.push('NaN values still present');
    }
    
    if (issues.length === 0) {
      console.log('\n✅ ALL TESTS PASSED! Everything is functional.');
    } else {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    }
    
    // Save detailed results
    fs.writeFileSync('final-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Detailed results saved to final-test-results.json');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    results.error = error.message;
  } finally {
    console.log('\n🔍 Browser staying open for manual inspection...');
    await page.waitForTimeout(60000); // 1 minute
    await browser.close();
  }
}

finalTest();