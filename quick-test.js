const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Quick functionality test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push('PAGE ERROR: ' + error.message);
  });
  
  try {
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'networkidle' 
    });
    
    // Skip tour
    await page.click('text=Skip Tour');
    await page.waitForTimeout(500);
    
    // Test AI speed slider
    console.log('🔍 Testing AI speed slider...');
    await page.click('[onclick="showTab(\'see\')"]');
    await page.waitForTimeout(1000);
    
    // Get initial values
    const initialGap = await page.locator('#incomeGapDisplay').textContent();
    console.log(`Initial gap: ${initialGap}`);
    
    // Check if updateAISpeed function exists
    const hasFunction = await page.evaluate(() => {
      return typeof updateAISpeed === 'function';
    });
    console.log(`updateAISpeed function exists: ${hasFunction ? '✅' : '❌'}`);
    
    // Try to move slider and call function directly
    await page.evaluate(() => {
      document.getElementById('aiSpeedSlider').value = 80;
      updateAISpeed();
    });
    
    await page.waitForTimeout(500);
    const newGap = await page.locator('#incomeGapDisplay').textContent();
    console.log(`New gap: ${newGap}`);
    console.log(`Gap changed: ${initialGap !== newGap ? '✅' : '❌'}`);
    
    // Test Future Scenarios
    console.log('\n🔍 Testing Future Scenarios...');
    await page.click('[onclick="showTab(\'future\')"]');
    await page.waitForTimeout(1000);
    
    const futureGap = await page.locator('#futureGapValue').textContent();
    console.log(`Future gap value: ${futureGap}`);
    console.log(`Contains NaN: ${futureGap.includes('NaN') ? '❌ YES!' : '✅ NO'}`);
    
    // Try to trigger updateFutureScenario
    await page.evaluate(() => {
      if (typeof updateFutureScenario === 'function') {
        updateFutureScenario();
      }
    });
    
    const updatedFutureGap = await page.locator('#futureGapValue').textContent();
    console.log(`Updated future gap: ${updatedFutureGap}`);
    
    // Check for errors
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors Found:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    } else {
      console.log('\n✅ No JavaScript errors');
    }
    
    // Check if Plotly loaded
    const plotlyLoaded = await page.evaluate(() => {
      return typeof Plotly !== 'undefined';
    });
    console.log(`\nPlotly loaded: ${plotlyLoaded ? '✅' : '❌'}`);
    
    // Check if plots exist
    const mainVizExists = await page.evaluate(() => {
      const el = document.getElementById('mainVisualization');
      return el && el.children.length > 0;
    });
    console.log(`Main visualization rendered: ${mainVizExists ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await page.waitForTimeout(5000); // Keep open for 5 seconds
    await browser.close();
  }
})();