package bot.jarvis.coc.service

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.graphics.Path
import android.view.accessibility.AccessibilityNodeInfo

import bot.jarvis.coc.core.InputManager

class CocAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        InputManager.registerAccessibilityService(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        InputManager.unregisterAccessibilityService()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // 用于监听游戏窗口变化或特定 UI 元素出现
    }

    override fun onInterrupt() {
        // 服务中断处理
    }

    /**
     * 执行点击操作
     * Performs a click at (x, y)
     */
    fun click(x: Float, y: Float) {
        val path = Path()
        path.moveTo(x, y)
        val gestureBuilder = android.accessibilityservice.GestureDescription.Builder()
        gestureBuilder.addStroke(android.accessibilityservice.GestureDescription.StrokeDescription(path, 0, 100))
        dispatchGesture(gestureBuilder.build(), null, null)
    }

    /**
     * 执行滑动操作
     * Performs a swipe from (x1, y1) to (x2, y2)
     */
    fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long) {
        val path = Path()
        path.moveTo(x1, y1)
        path.lineTo(x2, y2)
        val gestureBuilder = android.accessibilityservice.GestureDescription.Builder()
        gestureBuilder.addStroke(android.accessibilityservice.GestureDescription.StrokeDescription(path, 0, duration))
        dispatchGesture(gestureBuilder.build(), null, null)
    }

    /**
     * 执行返回操作
     * Performs a back button press
     */
    fun pressBack() {
        performGlobalAction(GLOBAL_ACTION_BACK)
    }
}
