const { chromium } = require('playwright');

async function testFixes() {
  console.log('🧪 Testing fixes...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[ERROR] ${msg.text()}`);
  });
  
  try {
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'networkidle' 
    });
    
    // Skip welcome
    await page.evaluate(() => {
      const welcome = document.getElementById('welcomeSection');
      const tabs = document.getElementById('mainTabs');
      if (welcome) welcome.classList.add('hidden');
      if (tabs) tabs.classList.remove('hidden');
      document.getElementById('tourOverlay').style.display = 'none';
      document.getElementById('tourPopup').style.display = 'none';
    });
    
    // Test 1: AI Speed Slider
    console.log('🎚️ Test 1: AI Speed Slider');
    await page.evaluate(() => showTab('see'));
    await page.waitForTimeout(1000);
    
    // Test extreme values
    const sliderTests = [10, 50, 90, 100];
    
    for (const value of sliderTests) {
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
      
      console.log(`  Slider=${value}: Elite=${state.elite}, Mass=${state.mass}, Gap=${state.gap}`);
      
      if (state.elite.includes('NaN') || state.gap.includes('NaN')) {
        console.log('  ❌ Still has NaN!');
      } else {
        console.log('  ✅ No NaN');
      }
    }
    
    // Test 2: Future Scenarios
    console.log('\n🔮 Test 2: Future Scenarios');
    await page.evaluate(() => showTab('future'));
    await page.waitForTimeout(1000);
    
    const futureTests = [
      { ai: 0, intervention: 0 },
      { ai: 50, intervention: 50 },
      { ai: 100, intervention: 100 }
    ];
    
    for (const test of futureTests) {
      await page.evaluate((t) => {
        document.getElementById('futureAISlider').value = t.ai;
        document.getElementById('interventionSlider').value = t.intervention;
        updateFutureScenario();
      }, test);
      
      await page.waitForTimeout(500);
      
      const state = await page.evaluate(() => ({
        gap: document.getElementById('futureGapValue').textContent,
        rich: document.getElementById('richIncome').textContent,
        poor: document.getElementById('poorIncome').textContent
      }));
      
      console.log(`  AI=${test.ai}, Int=${test.intervention}: Gap=${state.gap}, Rich=${state.rich}, Poor=${state.poor}`);
      
      if (state.gap.includes('NaN') || state.rich.includes('NaN')) {
        console.log('  ❌ Still has NaN!');
      } else {
        console.log('  ✅ No NaN');
      }
    }
    
    // Test 3: All Visualizations
    console.log('\n📊 Test 3: All Visualizations');
    const tabs = ['see', 'why', 'future', 'reality'];
    
    for (const tab of tabs) {
      await page.evaluate((t) => showTab(t), tab);
      await page.waitForTimeout(1000);
      
      const errors = await page.evaluate(() => {
        // Check if any error messages in console
        return window.consoleErrors || [];
      });
      
      console.log(`  ${tab} tab: ${errors.length === 0 ? '✅ No errors' : `❌ ${errors.length} errors`}`);
    }
    
    // Final check
    console.log('\n🏁 Final Check:');
    const finalCheck = await page.evaluate(() => {
      const results = {
        plotlyLoaded: typeof Plotly !== 'undefined',
        mathJaxLoaded: typeof MathJax !== 'undefined',
        threeLoaded: typeof THREE !== 'undefined',
        functionsExist: {
          showTab: typeof showTab === 'function',
          updateAISpeed: typeof updateAISpeed === 'function',
          updateFutureScenario: typeof updateFutureScenario === 'function',
          simulateKnowledge: typeof simulateKnowledge === 'function'
        }
      };
      return results;
    });
    
    console.log('Libraries:', {
      Plotly: finalCheck.plotlyLoaded ? '✅' : '❌',
      MathJax: finalCheck.mathJaxLoaded ? '✅' : '❌',
      'Three.js': finalCheck.threeLoaded ? '✅' : '❌'
    });
    
    console.log('Functions:', Object.entries(finalCheck.functionsExist)
      .map(([name, exists]) => `${name}: ${exists ? '✅' : '❌'}`)
      .join(', '));
    
    console.log('\n✅ Tests complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await page.waitForTimeout(30000); // Keep open for 30 seconds
    await browser.close();
  }
}

testFixes();