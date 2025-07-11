const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting comprehensive functionality tests...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  try {
    console.log('📍 Loading website...');
    await page.goto('https://knowledge-divergence-model.vercel.app', { 
      waitUntil: 'networkidle' 
    });
    
    // Check if main elements exist
    console.log('\n🔍 Checking main elements:');
    const hasWelcome = await page.locator('#welcomeSection').isVisible();
    console.log(`  Welcome section: ${hasWelcome ? '✅' : '❌'}`);
    
    // Skip tour and go to main content
    await page.click('text=Skip Tour');
    await page.waitForTimeout(1000);
    
    // Test each tab
    const tabs = ['story', 'see', 'why', 'future', 'reality'];
    console.log('\n🔍 Testing tabs:');
    
    for (const tab of tabs) {
      console.log(`\n  Testing "${tab}" tab:`);
      await page.click(`[onclick="showTab('${tab}')"]`);
      await page.waitForTimeout(1000);
      
      const content = await page.locator(`#${tab}`).isVisible();
      console.log(`    Content visible: ${content ? '✅' : '❌'}`);
      
      // Check for specific elements in each tab
      if (tab === 'see') {
        // Test AI speed slider
        console.log('    Testing AI speed slider:');
        const slider = await page.locator('#aiSpeedSlider');
        const sliderExists = await slider.count() > 0;
        console.log(`      Slider exists: ${sliderExists ? '✅' : '❌'}`);
        
        if (sliderExists) {
          // Get initial values
          const initialEliteIncome = await page.locator('#eliteIncome').textContent();
          const initialMassIncome = await page.locator('#massIncome').textContent();
          const initialGap = await page.locator('#incomeGapDisplay').textContent();
          
          console.log(`      Initial values: Elite=${initialEliteIncome}, Mass=${initialMassIncome}, Gap=${initialGap}`);
          
          // Move slider
          await slider.fill('80');
          await page.waitForTimeout(1000);
          
          // Check if values changed
          const newEliteIncome = await page.locator('#eliteIncome').textContent();
          const newMassIncome = await page.locator('#massIncome').textContent();
          const newGap = await page.locator('#incomeGapDisplay').textContent();
          
          console.log(`      After slider: Elite=${newEliteIncome}, Mass=${newMassIncome}, Gap=${newGap}`);
          console.log(`      Values changed: ${(initialEliteIncome !== newEliteIncome) ? '✅' : '❌'}`);
        }
        
        // Check if main visualization exists
        const hasMainViz = await page.locator('#mainVisualization').count() > 0;
        console.log(`    Main visualization exists: ${hasMainViz ? '✅' : '❌'}`);
        
        const hasAccelViz = await page.locator('#accelerationVisualization').count() > 0;
        console.log(`    Acceleration visualization exists: ${hasAccelViz ? '✅' : '❌'}`);
      }
      
      if (tab === 'why') {
        // Test factor cards
        const factorCards = await page.locator('.factor-card').count();
        console.log(`    Factor cards found: ${factorCards}`);
        
        if (factorCards > 0) {
          await page.click('.factor-card:first-child');
          await page.waitForTimeout(500);
          const demoContent = await page.locator('#demoContent').textContent();
          console.log(`    Demo content updated: ${demoContent.includes('Click a factor') ? '❌' : '✅'}`);
        }
        
        const hasFactorsViz = await page.locator('#factorsVisualization').count() > 0;
        console.log(`    Factors visualization exists: ${hasFactorsViz ? '✅' : '❌'}`);
      }
      
      if (tab === 'future') {
        console.log('    Testing Future Scenarios:');
        
        // Check sliders
        const aiSlider = await page.locator('#futureAISlider').count() > 0;
        const intSlider = await page.locator('#interventionSlider').count() > 0;
        console.log(`      AI slider exists: ${aiSlider ? '✅' : '❌'}`);
        console.log(`      Intervention slider exists: ${intSlider ? '✅' : '❌'}`);
        
        // Check income displays
        const richIncome = await page.locator('#richIncome').textContent();
        const poorIncome = await page.locator('#poorIncome').textContent();
        console.log(`      Rich income: ${richIncome}`);
        console.log(`      Poor income: ${poorIncome}`);
        
        // Check gap value
        const gapValue = await page.locator('#futureGapValue').textContent();
        console.log(`      Gap value: ${gapValue}`);
        console.log(`      Has NaN: ${gapValue.includes('NaN') ? '❌ FOUND NaN!' : '✅ No NaN'}`);
        
        // Try moving sliders
        if (aiSlider) {
          await page.locator('#futureAISlider').fill('90');
          await page.waitForTimeout(500);
          const newGapValue = await page.locator('#futureGapValue').textContent();
          console.log(`      Gap after slider change: ${newGapValue}`);
        }
      }
      
      if (tab === 'reality') {
        const hasQuiz = await page.locator('#realityQuiz').count() > 0;
        console.log(`    Reality quiz exists: ${hasQuiz ? '✅' : '❌'}`);
        
        const hasChart = await page.locator('#realityChart').count() > 0;
        console.log(`    Reality chart exists: ${hasChart ? '✅' : '❌'}`);
      }
    }
    
    // Check for JavaScript errors
    console.log('\n🔍 Checking for JavaScript errors in console...');
    await page.evaluate(() => {
      console.log('Test log from page context');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('\n✅ Tests complete. Check the browser window.');
    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // 5 minutes
    await browser.close();
  }
})();