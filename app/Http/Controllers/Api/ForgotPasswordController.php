use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    /**
     * Send a 6-digit reset code to the user's email (simulated).
     */
    public function sendResetCode(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in DB
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($code),
                'created_at' => now()
            ]
        );

        // Simulate sending email
        Log::info("Password reset code for {$request->email}: {$code}");

        return response()->json([
            'message' => 'Un code de réinitialisation a été envoyé à votre adresse email.',
            'debug_code' => $code // Included for easy development testing
        ]);
    }

    /**
     * Reset password using the code.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $reset = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$reset || !Hash::check($request->code, $reset->token)) {
            return response()->json(['message' => 'Le code est invalide ou a expiré.'], 422);
        }

        // Check expiry (e.g., 60 minutes)
        if (now()->diffInMinutes($reset->created_at) > 60) {
            return response()->json(['message' => 'Le code a expiré.'], 422);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all tokens for security
        $user->tokens()->delete();

        return response()->json(['message' => 'Votre mot de passe a été réinitialisé avec succès.']);
    }
}
