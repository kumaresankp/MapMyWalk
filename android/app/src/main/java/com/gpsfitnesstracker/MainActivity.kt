package com.gpsfitnesstracker

import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String =
      "MyWalkMap"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(
          this,
          mainComponentName,
          fabricEnabled
      )

  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory =
        RNScreensFragmentFactory()

    RNBootSplash.init(
        this,
        R.style.BootTheme
    )

    super.onCreate(savedInstanceState)
  }
}