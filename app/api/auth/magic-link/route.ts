import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/src/infrastructure/database/supabase-server";
import { sanitizeRedirectUrl } from "@/src/infrastructure/auth/safe-redirect";

const MagicLinkRequestSchema = z.object({
  email: z.string().email("Email không đúng định dạng."),
  next: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = MagicLinkRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, next } = parseResult.data;
    const safeNext = sanitizeRedirectUrl(next, "/dashboard");

    if (!isSupabaseConfigured()) {
      // Graceful local development / test mode
      const origin = request.nextUrl.origin;
      const mockCallback = `${origin}/auth/callback?code=mock_dev_code&next=${encodeURIComponent(safeNext)}&email=${encodeURIComponent(email)}`;

      return NextResponse.json({
        success: true,
        message: "Chế độ phát triển: Đã tạo liên kết đăng nhập giả lập.",
        mockUrl: mockCallback,
      });
    }

    const supabase = getSupabaseServerClient()!;
    const origin = request.nextUrl.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: "Không thể gửi liên kết đăng nhập. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Liên kết đăng nhập đã được gửi tới hòm thư của bạn.",
    });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi xử lý yêu cầu đăng nhập." },
      { status: 500 }
    );
  }
}
