const { chromium } = require('playwright');
const fs = require('fs');

async function testFunctionality() {
  console.log('🚀 Comprehensive functionality test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const issues = [];
  const successes = [];
  
  // Capture all console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push(`Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    issues.push(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('📍 Loading page...');
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'networkidle' 
    });
    
    // Initial state check
    console.log('🔍 Checking initial state...');
    
    // Check if critical libraries loaded
    const librariesCheck = await page.evaluate(() => {
      return {
        plotly: typeof Plotly !== 'undefined',
        mathJax: typeof MathJax !== 'undefined',
        three: typeof THREE !== 'undefined'
      };
    });
    
    if (librariesCheck.plotly) successes.push('✅ Plotly loaded');
    else issues.push('❌ Plotly not loaded');
    
    if (librariesCheck.mathJax) successes.push('✅ MathJax loaded');
    else issues.push('❌ MathJax not loaded');
    
    if (librariesCheck.three) successes.push('✅ Three.js loaded');
    else issues.push('❌ Three.js not loaded');
    
    // Navigate past welcome screen
    console.log('\n🔍 Navigating to main content...');
    await page.evaluate(() => {
      const welcome = document.getElementById('welcomeSection');
      const tabs = document.getElementById('mainTabs');
      const overlay = document.getElementById('tourOverlay');
      const popup = document.getElementById('tourPopup');
      
      if (welcome) welcome.classList.add('hidden');
      if (tabs) tabs.classList.remove('hidden');
      if (overlay) overlay.style.display = 'none';
      if (popup) popup.style.display = 'none';
    });
    
    // Test each tab systematically
    console.log('\n🔍 Testing all tabs...');
    
    // 1. Test "See It Happen" tab
    console.log('\n📊 Testing "See It Happen" tab...');
    await page.evaluate(() => showTab('see'));
    await page.waitForTimeout(1000);
    
    // Check if plots were created
    const seeTabCheck = await page.evaluate(() => {
      const results = {};
      
      // Check main visualization
      const mainViz = document.getElementById('mainVisualization');
      results.mainVizExists = !!mainViz;
      results.mainVizHasPlot = mainViz && mainViz.querySelector('.plot-container') !== null;
      results.mainVizChildren = mainViz ? mainViz.children.length : 0;
      
      // Check acceleration visualization
      const accelViz = document.getElementById('accelerationVisualization');
      results.accelVizExists = !!accelViz;
      results.accelVizHasPlot = accelViz && accelViz.querySelector('.plot-container') !== null;
      results.accelVizChildren = accelViz ? accelViz.children.length : 0;
      
      // Check if slider exists and works
      const slider = document.getElementById('aiSpeedSlider');
      results.sliderExists = !!slider;
      results.sliderValue = slider ? slider.value : null;
      
      // Check income displays
      results.eliteIncome = document.getElementById('eliteIncome')?.textContent;
      results.massIncome = document.getElementById('massIncome')?.textContent;
      results.incomeGap = document.getElementById('incomeGapDisplay')?.textContent;
      
      return results;
    });
    
    console.log('Main visualization:', seeTabCheck.mainVizExists ? 
      `✅ Exists (${seeTabCheck.mainVizChildren} children)` : '❌ Missing');
    console.log('Acceleration visualization:', seeTabCheck.accelVizExists ? 
      `✅ Exists (${seeTabCheck.accelVizChildren} children)` : '❌ Missing');
    console.log('AI Speed Slider:', seeTabCheck.sliderExists ? 
      `✅ Exists (value: ${seeTabCheck.sliderValue})` : '❌ Missing');
    console.log('Income displays:', seeTabCheck.eliteIncome ? 
      `✅ Elite: ${seeTabCheck.eliteIncome}, Mass: ${seeTabCheck.massIncome}, Gap: ${seeTabCheck.incomeGap}` : 
      '❌ Missing');
    
    // Test slider functionality
    if (seeTabCheck.sliderExists) {
      console.log('\n🎚️ Testing slider functionality...');
      const initialGap = seeTabCheck.incomeGap;
      
      await page.evaluate(() => {
        const slider = document.getElementById('aiSpeedSlider');
        slider.value = 90;
        if (typeof updateAISpeed === 'function') {
          updateAISpeed();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const afterSliderCheck = await page.evaluate(() => {
        return {
          incomeGap: document.getElementById('incomeGapDisplay')?.textContent,
          sliderValue: document.getElementById('aiSpeedSlider')?.value
        };
      });
      
      if (initialGap !== afterSliderCheck.incomeGap) {
        successes.push('✅ AI Speed slider updates values');
      } else {
        issues.push('❌ AI Speed slider does not update values');
      }
    }
    
    // 2. Test "Why It Happens" tab
    console.log('\n📊 Testing "Why It Happens" tab...');
    await page.evaluate(() => showTab('why'));
    await page.waitForTimeout(1000);
    
    const whyTabCheck = await page.evaluate(() => {
      const results = {};
      results.factorCards = document.querySelectorAll('.factor-card').length;
      results.factorDemo = !!document.getElementById('factorDemo');
      results.factorsViz = !!document.getElementById('factorsVisualization');
      results.factorsVizChildren = document.getElementById('factorsVisualization')?.children.length || 0;
      return results;
    });
    
    console.log('Factor cards:', whyTabCheck.factorCards > 0 ? 
      `✅ ${whyTabCheck.factorCards} cards found` : '❌ No cards');
    console.log('Factor demo area:', whyTabCheck.factorDemo ? '✅ Exists' : '❌ Missing');
    console.log('Factors visualization:', whyTabCheck.factorsViz ? 
      `✅ Exists (${whyTabCheck.factorsVizChildren} children)` : '❌ Missing');
    
    // Test factor card interaction
    if (whyTabCheck.factorCards > 0) {
      await page.evaluate(() => {
        const firstCard = document.querySelector('.factor-card');
        if (firstCard && typeof showFactor === 'function') {
          firstCard.click();
        }
      });
      
      await page.waitForTimeout(500);
      
      const demoUpdated = await page.evaluate(() => {
        const demo = document.getElementById('demoContent');
        return demo && !demo.textContent.includes('Click a factor above');
      });
      
      if (demoUpdated) {
        successes.push('✅ Factor cards interactive');
      } else {
        issues.push('❌ Factor cards not working');
      }
    }
    
    // 3. Test "Future Scenarios" tab
    console.log('\n📊 Testing "Future Scenarios" tab...');
    await page.evaluate(() => showTab('future'));
    await page.waitForTimeout(1000);
    
    const futureTabCheck = await page.evaluate(() => {
      const results = {};
      results.aiSlider = !!document.getElementById('futureAISlider');
      results.interventionSlider = !!document.getElementById('interventionSlider');
      results.futureGap = document.getElementById('futureGapValue')?.textContent;
      results.richIncome = document.getElementById('richIncome')?.textContent;
      results.poorIncome = document.getElementById('poorIncome')?.textContent;
      results.societyHealth = document.getElementById('societyHealthBar')?.style.width;
      results.futureViz = !!document.getElementById('futureVisualization');
      return results;
    });
    
    console.log('Future AI Slider:', futureTabCheck.aiSlider ? '✅ Exists' : '❌ Missing');
    console.log('Intervention Slider:', futureTabCheck.interventionSlider ? '✅ Exists' : '❌ Missing');
    console.log('Future Gap Value:', futureTabCheck.futureGap || 'Missing');
    
    if (futureTabCheck.futureGap && futureTabCheck.futureGap.includes('NaN')) {
      issues.push('❌ Future Scenarios showing NaN');
    } else if (futureTabCheck.futureGap) {
      successes.push('✅ Future Scenarios calculating correctly');
    }
    
    // Test future sliders
    if (futureTabCheck.aiSlider) {
      await page.evaluate(() => {
        document.getElementById('futureAISlider').value = 80;
        document.getElementById('interventionSlider').value = 50;
        if (typeof updateFutureScenario === 'function') {
          updateFutureScenario();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const afterFutureUpdate = await page.evaluate(() => {
        return document.getElementById('futureGapValue')?.textContent;
      });
      
      console.log('Gap after slider update:', afterFutureUpdate);
    }
    
    // 4. Test "Reality" tab
    console.log('\n📊 Testing "Reality" tab...');
    await page.evaluate(() => showTab('reality'));
    await page.waitForTimeout(1000);
    
    const realityTabCheck = await page.evaluate(() => {
      const results = {};
      results.quiz = !!document.getElementById('realityQuiz');
      results.chart = !!document.getElementById('realityChart');
      results.chartChildren = document.getElementById('realityChart')?.children.length || 0;
      return results;
    });
    
    console.log('Reality Quiz:', realityTabCheck.quiz ? '✅ Exists' : '❌ Missing');
    console.log('Reality Chart:', realityTabCheck.chart ? 
      `✅ Exists (${realityTabCheck.chartChildren} children)` : '❌ Missing');
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\n✅ SUCCESSES:');
    successes.forEach(s => console.log(`  ${s}`));
    
    console.log('\n❌ ISSUES:');
    issues.forEach(i => console.log(`  ${i}`));
    
    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      successes: successes,
      issues: issues,
      detailedChecks: {
        seeTab: seeTabCheck,
        whyTab: whyTabCheck,
        futureTab: futureTabCheck,
        realityTab: realityTabCheck
      }
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to test-report.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    issues.push(`Test Error: ${error.message}`);
  } finally {
    console.log('\nBrowser will stay open for manual inspection...');
    await page.waitForTimeout(60000); // Keep open for 1 minute
    await browser.close();
  }
}

testFunctionality();