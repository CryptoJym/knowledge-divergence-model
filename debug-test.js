const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debug test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable detailed console logging
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('Loading page...');
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'domcontentloaded' 
    });
    
    // Take screenshot
    await page.screenshot({ path: 'initial-state.png' });
    console.log('Screenshot saved as initial-state.png');
    
    // Check what's visible
    const welcomeVisible = await page.locator('#welcomeSection').isVisible();
    const mainTabsVisible = await page.locator('#mainTabs').isVisible();
    
    console.log(`Welcome section visible: ${welcomeVisible}`);
    console.log(`Main tabs visible: ${mainTabsVisible}`);
    
    // Try to find skip button
    const skipButtons = await page.locator('button:has-text("Skip")').all();
    console.log(`Found ${skipButtons.length} skip buttons`);
    
    if (skipButtons.length > 0) {
      for (let i = 0; i < skipButtons.length; i++) {
        const isVisible = await skipButtons[i].isVisible();
        const text = await skipButtons[i].textContent();
        console.log(`Button ${i}: "${text}" - visible: ${isVisible}`);
      }
    }
    
    // Check for errors in initialization
    const errors = await page.evaluate(() => {
      const errs = [];
      try {
        // Check if key functions exist
        if (typeof showTab !== 'function') errs.push('showTab function missing');
        if (typeof updateAISpeed !== 'function') errs.push('updateAISpeed function missing');
        if (typeof simulateKnowledge !== 'function') errs.push('simulateKnowledge function missing');
        if (typeof plotMainVisualization !== 'function') errs.push('plotMainVisualization function missing');
        if (typeof Plotly === 'undefined') errs.push('Plotly not loaded');
        if (typeof MathJax === 'undefined') errs.push('MathJax not loaded');
      } catch (e) {
        errs.push('Error checking functions: ' + e.message);
      }
      return errs;
    });
    
    if (errors.length > 0) {
      console.log('\n❌ Missing components:');
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Try different ways to proceed
    console.log('\nTrying to proceed to main content...');
    
    // Method 1: Click skipTour if it exists
    try {
      await page.click('button:has-text("Skip Tour")', { timeout: 2000 });
      console.log('✅ Clicked Skip Tour');
    } catch {
      console.log('Skip Tour button not found');
      
      // Method 2: Call skipTour directly
      try {
        await page.evaluate(() => {
          if (typeof skipTour === 'function') {
            skipTour();
          }
        });
        console.log('✅ Called skipTour() directly');
      } catch {
        console.log('skipTour function not available');
        
        // Method 3: Manually hide welcome and show tabs
        await page.evaluate(() => {
          const welcome = document.getElementById('welcomeSection');
          const tabs = document.getElementById('mainTabs');
          if (welcome) welcome.classList.add('hidden');
          if (tabs) tabs.classList.remove('hidden');
          // Show first tab
          if (typeof showTab === 'function') {
            showTab('story');
          }
        });
        console.log('✅ Manually showed main content');
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Take another screenshot
    await page.screenshot({ path: 'after-skip.png' });
    console.log('Screenshot saved as after-skip.png');
    
    // Now test the main functionality
    console.log('\n🔍 Testing main functionality...');
    
    // Click on "See It Happen" tab
    await page.evaluate(() => {
      if (typeof showTab === 'function') {
        showTab('see');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check if visualizations were created
    const vizCheck = await page.evaluate(() => {
      const results = {};
      const mainViz = document.getElementById('mainVisualization');
      results.mainVizExists = !!mainViz;
      results.mainVizHasContent = mainViz ? mainViz.children.length > 0 : false;
      
      const accelViz = document.getElementById('accelerationVisualization');
      results.accelVizExists = !!accelViz;
      results.accelVizHasContent = accelViz ? accelViz.children.length > 0 : false;
      
      return results;
    });
    
    console.log('Visualization check:', vizCheck);
    
    console.log('\nBrowser will stay open for inspection...');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await page.waitForTimeout(60000); // Keep open for 1 minute
    await browser.close();
  }
})();