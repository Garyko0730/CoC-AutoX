package bot.jarvis.coc.core

import android.util.Log
import bot.jarvis.coc.service.CocAccessibilityService

interface InputProvider {
    fun tap(x: Float, y: Float): Boolean
    fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long): Boolean
}

class RootInputProvider : InputProvider {
    override fun tap(x: Float, y: Float): Boolean {
        return ShellExecutor.tap(x.toInt(), y.toInt())
    }

    override fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long): Boolean {
        return ShellExecutor.swipe(x1.toInt(), y1.toInt(), x2.toInt(), y2.toInt(), duration.toInt())
    }
}

class AccessibilityInputProvider(private val service: CocAccessibilityService) : InputProvider {
    override fun tap(x: Float, y: Float): Boolean {
        service.click(x, y)
        return true
    }

    override fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long): Boolean {
        service.swipe(x1, y1, x2, y2, duration)
        return true
    }
}

object InputManager {
    private const val TAG = "InputManager"
    private var accessibilityService: CocAccessibilityService? = null
    private val rootProvider = RootInputProvider()

    // Configuration: Prefer Root?
    var preferRoot: Boolean = false

    fun registerAccessibilityService(service: CocAccessibilityService) {
        accessibilityService = service
        Log.i(TAG, "Accessibility Service Registered")
    }

    fun unregisterAccessibilityService() {
        accessibilityService = null
        Log.i(TAG, "Accessibility Service Unregistered")
    }

    fun tap(x: Float, y: Float): Boolean {
        return getProvider().tap(x, y)
    }

    fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long): Boolean {
        return getProvider().swipe(x1, y1, x2, y2, duration)
    }

    fun pressBack(): Boolean {
        val accService = accessibilityService
        return if (accService != null) {
            accService.pressBack()
            true
        } else {
            ShellExecutor.pressBack()
        }
    }

    private fun getProvider(): InputProvider {
        val accService = accessibilityService
        
        // Strategy: 
        // 1. If Accessibility is available and we don't strictly prefer Root, use it (Faster).
        // 2. If Root is available, use it.
        // 3. Else, log error.

        if (preferRoot) {
            if (ShellExecutor.isRootAvailable()) return rootProvider
        }

        if (accService != null) {
            return AccessibilityInputProvider(accService)
        }

        if (ShellExecutor.isRootAvailable()) {
            return rootProvider
        }

        Log.e(TAG, "No input provider available! Enable Accessibility Service or Root.")
        return object : InputProvider {
            override fun tap(x: Float, y: Float) = false
            override fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long) = false
        }
    }
}
