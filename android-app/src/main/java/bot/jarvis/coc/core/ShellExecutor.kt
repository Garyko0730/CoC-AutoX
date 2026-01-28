package bot.jarvis.coc.core

import java.io.DataOutputStream

object ShellExecutor {
    /**
     * 检查 Root 权限
     * Check if Root is available
     */
    fun isRootAvailable(): Boolean {
        return exec("true")
    }

    /**
     * 在 Root 环境下执行命令
     * Executes a command in Root environment
     */
    fun exec(command: String): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("su")
            val os = DataOutputStream(process.outputStream)
            os.writeBytes("$command\n")
            os.writeBytes("exit\n")
            os.flush()
            process.waitFor()
            process.exitValue() == 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 模拟点击 (Root)
     * Simulated Tap (Root)
     */
    fun tap(x: Int, y: Int) = exec("input tap $x $y")

    /**
     * 模拟滑动 (Root)
     * Simulated Swipe (Root)
     */
    fun swipe(x1: Int, y1: Int, x2: Int, y2: Int, duration: Int) = 
        exec("input swipe $x1 $y1 $x2 $y2 $duration")

    /**
     * 截屏 (Root)
     * Screenshot (Root)
     */
    fun captureScreen(path: String) = exec("screencap -p $path")
}
