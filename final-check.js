const { chromium } = require('playwright');

async function finalCheck() {
  console.log('🏆 Final functionality check...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const issues = [];
  const successes = [];
  
  try {
    await page.goto('https://knowledge-divergence-model.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('✅ Live site loaded successfully\n');
    
    // Skip welcome
    await page.evaluate(() => {
      const welcome = document.getElementById('welcomeSection');
      if (welcome && !welcome.classList.contains('hidden')) {
        const skipButton = document.querySelector('button[onclick="skipTour()"]');
        if (skipButton) skipButton.click();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Test 1: AI Speed Slider
    console.log('📊 Test 1: AI Speed Slider');
    await page.click('[onclick="showTab(\'see\', event)"]');
    await page.waitForTimeout(1000);
    
    const sliderValues = [];
    for (const value of [10, 50, 90]) {
      await page.locator('#aiSpeedSlider').fill(String(value));
      await page.waitForTimeout(500);
      
      const gap = await page.locator('#incomeGapDisplay').textContent();
      sliderValues.push(gap);
      console.log(`  ${value}%: Gap = ${gap}`);
    }
    
    const uniqueSliderValues = [...new Set(sliderValues)];
    if (uniqueSliderValues.length > 1) {
      successes.push('AI Speed slider shows dynamic values');
    } else {
      issues.push('AI Speed slider stuck at same value');
    }
    
    // Test 2: Future Scenarios
    console.log('\n📊 Test 2: Future Scenarios');
    await page.click('[onclick="showTab(\'future\', event)"]');
    await page.waitForTimeout(1000);
    
    const futureValues = [];
    for (const [ai, int] of [[10, 10], [90, 90]]) {
      await page.locator('#futureAISlider').fill(String(ai));
      await page.locator('#interventionSlider').fill(String(int));
      await page.waitForTimeout(500);
      
      const gap = await page.locator('#futureGapValue').textContent();
      futureValues.push(gap);
      console.log(`  AI=${ai}, Int=${int}: Gap = ${gap}`);
    }
    
    const uniqueFutureValues = [...new Set(futureValues)];
    if (uniqueFutureValues.length > 1) {
      successes.push('Future Scenarios shows dynamic values');
    } else {
      issues.push('Future Scenarios stuck at same value');
    }
    
    // Test 3: Factor Cards
    console.log('\n📊 Test 3: Interactive Elements');
    await page.click('[onclick="showTab(\'why\', event)"]');
    await page.waitForTimeout(1000);
    
    const initialDemo = await page.locator('#demoContent').textContent();
    await page.click('.factor-card:first-child');
    await page.waitForTimeout(500);
    const newDemo = await page.locator('#demoContent').textContent();
    
    if (initialDemo !== newDemo && !newDemo.includes('Click a factor')) {
      successes.push('Factor cards are interactive');
      console.log('  Factor cards: ✅ Working');
    } else {
      issues.push('Factor cards not interactive');
      console.log('  Factor cards: ❌ Not working');
    }
    
    // Test 4: 3D Visualization
    console.log('\n📊 Test 4: 3D Visualization');
    await page.click('[onclick="showTab(\'visualize3d\', event)"]');
    await page.waitForTimeout(2000);
    
    const hasCanvas = await page.evaluate(() => {
      const container = document.getElementById('three-container');
      return container && container.querySelector('canvas') !== null;
    });
    
    if (hasCanvas) {
      successes.push('3D visualization renders');
      console.log('  3D Visualization: ✅ Rendered');
    } else {
      issues.push('3D visualization not rendering');
      console.log('  3D Visualization: ❌ Not rendered');
    }
    
    // Test 5: NaN Check
    const nanCheck = await page.evaluate(() => {
      const elements = document.querySelectorAll('[id]');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes('NaN')) {
          return true;
        }
      }
      return false;
    });
    
    if (!nanCheck) {
      successes.push('No NaN errors found');
    } else {
      issues.push('NaN errors still present');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🏆 FINAL RESULTS');
    console.log('='.repeat(50));
    
    console.log('\n✅ WORKING:');
    successes.forEach(s => console.log(`  - ${s}`));
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES:');
      issues.forEach(i => console.log(`  - ${i}`));
    }
    
    const allPassed = issues.length === 0;
    console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  Some issues remain'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    console.log('\n👀 Keeping browser open for manual inspection...');
    await page.waitForTimeout(300000); // 5 minutes
    await browser.close();
  }
}

finalCheck();