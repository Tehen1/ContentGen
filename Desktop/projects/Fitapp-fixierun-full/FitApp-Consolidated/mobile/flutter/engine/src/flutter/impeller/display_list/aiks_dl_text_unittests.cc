// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "display_list/display_list.h"
#include "display_list/dl_blend_mode.h"
#include "display_list/dl_tile_mode.h"
#include "display_list/effects/dl_color_source.h"
#include "display_list/effects/dl_mask_filter.h"
#include "flutter/display_list/dl_builder.h"
#include "flutter/display_list/dl_color.h"
#include "flutter/display_list/dl_paint.h"
#include "flutter/fml/build_config.h"
#include "flutter/impeller/display_list/aiks_unittests.h"
#include "flutter/testing/testing.h"
<<<<<<< HEAD
=======
#include "impeller/display_list/aiks_context.h"
#include "impeller/display_list/dl_dispatcher.h"
#include "impeller/entity/contents/content_context.h"
>>>>>>> b25305a8832cfc6ba632a7f87ad455e319dccce8
#include "impeller/entity/contents/text_contents.h"
#include "impeller/entity/entity.h"
#include "impeller/geometry/matrix.h"
#include "impeller/typographer/backends/skia/text_frame_skia.h"

#include "impeller/typographer/backends/skia/typographer_context_skia.h"
#include "txt/platform.h"

using namespace flutter;
/////////////////////////////////////////////////////

namespace impeller {
namespace testing {

struct TextRenderOptions {
  bool stroke = false;
  Scalar font_size = 50;
  Scalar stroke_width = 1;
  DlColor color = DlColor::kYellow();
  DlPoint position = DlPoint(100, 200);
  std::shared_ptr<DlMaskFilter> filter;
  bool is_subpixel = false;
};

bool RenderTextInCanvasSkia(const std::shared_ptr<Context>& context,
                            DisplayListBuilder& canvas,
                            const std::string& text,
                            const std::string_view& font_fixture,
                            const TextRenderOptions& options = {},
                            const std::optional<SkFont>& font = std::nullopt) {
  // Draw the baseline.
  DlPaint paint;
  paint.setColor(DlColor::kAqua().withAlpha(255 * 0.25));
  canvas.DrawRect(
      DlRect::MakeXYWH(options.position.x - 50, options.position.y, 900, 10),
      paint);

  // Mark the point at which the text is drawn.
  paint.setColor(DlColor::kRed().withAlpha(255 * 0.25));
  canvas.DrawCircle(options.position, 5.0, paint);

  // Construct the text blob.
  SkFont selected_font;
  if (!font.has_value()) {
    auto c_font_fixture = std::string(font_fixture);
    auto mapping =
        flutter::testing::OpenFixtureAsSkData(c_font_fixture.c_str());
    if (!mapping) {
      return false;
    }
    sk_sp<SkFontMgr> font_mgr = txt::GetDefaultFontManager();
    selected_font = SkFont(font_mgr->makeFromData(mapping), options.font_size);
    if (options.is_subpixel) {
      selected_font.setSubpixel(true);
    }
  } else {
    selected_font = font.value();
  }
<<<<<<< HEAD
  sk_sp<SkFontMgr> font_mgr = txt::GetDefaultFontManager();
  SkFont sk_font(font_mgr->makeFromData(mapping), options.font_size);
  if (options.is_subpixel) {
    sk_font.setSubpixel(true);
  }
  auto blob = SkTextBlob::MakeFromString(text.c_str(), sk_font);
=======
  auto blob = SkTextBlob::MakeFromString(text.c_str(), selected_font);
>>>>>>> b25305a8832cfc6ba632a7f87ad455e319dccce8
  if (!blob) {
    return false;
  }

  // Create the Impeller text frame and draw it at the designated baseline.
  auto frame = MakeTextFrameFromTextBlobSkia(blob);

  DlPaint text_paint;
  text_paint.setColor(options.color);
  text_paint.setMaskFilter(options.filter);
  text_paint.setStrokeWidth(options.stroke_width);
  text_paint.setDrawStyle(options.stroke ? DlDrawStyle::kStroke
                                         : DlDrawStyle::kFill);
  canvas.DrawTextFrame(frame, options.position.x, options.position.y,
                       text_paint);
  return true;
}

TEST_P(AiksTest, CanRenderTextFrame) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);
  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf"));

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextFrameWithInvertedTransform) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);
  builder.Translate(1000, 0);
  builder.Scale(-1, 1);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf"));

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderStrokedTextFrame) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf",
      {
          .stroke = true,
      }));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextStrokeWidth) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  ASSERT_TRUE(RenderTextInCanvasSkia(GetContext(), builder, "LMNOP VWXYZ",
                                     "Roboto-Medium.ttf",
                                     {
                                         .stroke = true,
                                         .stroke_width = 4,
                                     }));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextFrameWithHalfScaling) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);
  builder.Scale(0.5, 0.5);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf"));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

<<<<<<< HEAD
TEST_P(AiksTest, CanRenderTextFrameWithScalingOverflow) {
  Scalar scale = 60.0;
  Scalar offsetx = -500.0;
  Scalar offsety = 700.0;
  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("scale", &scale, 1.f, 300.f);
      ImGui::SliderFloat("offsetx", &offsetx, -600.f, 100.f);
      ImGui::SliderFloat("offsety", &offsety, 600.f, 2048.f);
      ImGui::End();
    }
    DisplayListBuilder builder;
    builder.Scale(GetContentScale().x, GetContentScale().y);
    DlPaint paint;
    paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
    builder.DrawPaint(paint);
    builder.Scale(scale, scale);

    RenderTextInCanvasSkia(
        GetContext(), builder, "test", "Roboto-Regular.ttf",
        TextRenderOptions{
            .position = SkPoint::Make(offsetx / scale, offsety / scale),
        });
    return builder.Build();
  };
  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

TEST_P(AiksTest, CanRenderTextFrameWithFractionScaling) {
  Scalar fine_scale = 0.f;
  bool is_subpixel = false;
  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("Fine Scale", &fine_scale, -1, 1);
      ImGui::Checkbox("subpixel", &is_subpixel);
      ImGui::End();
    }

    DisplayListBuilder builder;
    DlPaint paint;
    paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
    builder.DrawPaint(paint);
    Scalar scale = 2.625 + fine_scale;
    builder.Scale(scale, scale);
    RenderTextInCanvasSkia(GetContext(), builder,
                           "the quick brown fox jumped over the lazy dog!.?",
                           "Roboto-Regular.ttf",
                           TextRenderOptions{.is_subpixel = is_subpixel});
    return builder.Build();
  };

  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

// https://github.com/flutter/flutter/issues/164958
TEST_P(AiksTest, TextRotated180Degrees) {
  float fpivot[2] = {200 + 30, 200 - 20};
  float rotation = 180;
  float foffset[2] = {200, 200};

  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("pivotx", &fpivot[0], 0, 300);
      ImGui::SliderFloat("pivoty", &fpivot[1], 0, 300);
      ImGui::SliderFloat("rotation", &rotation, 0, 360);
      ImGui::SliderFloat("foffsetx", &foffset[0], 0, 300);
      ImGui::SliderFloat("foffsety", &foffset[1], 0, 300);
      ImGui::End();
    }
    DisplayListBuilder builder;
    builder.Scale(GetContentScale().x, GetContentScale().y);
    builder.DrawPaint(DlPaint().setColor(DlColor(0xffffeeff)));

    builder.Save();
    DlPoint pivot = Point(fpivot[0], fpivot[1]);
    builder.Translate(pivot.x, pivot.y);
    builder.Rotate(rotation);
    builder.Translate(-pivot.x, -pivot.y);

    RenderTextInCanvasSkia(
        GetContext(), builder, "test", "Roboto-Regular.ttf",
        TextRenderOptions{
            .color = DlColor::kBlack(),
            .position = SkPoint::Make(foffset[0], foffset[1]),
        });

    builder.Restore();
    return builder.Build();
  };
  ASSERT_TRUE(OpenPlaygroundHere(callback));
=======
// This is a test that looks for glyph artifacts we've see.
TEST_P(AiksTest, ScaledK) {
  DisplayListBuilder builder;
  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);
  for (int i = 0; i < 6; ++i) {
    builder.Save();
    builder.Translate(300 * i, 0);
    Scalar scale = 0.445 - (i / 1000.f);
    builder.Scale(scale, scale);
    RenderTextInCanvasSkia(
        GetContext(), builder, "k", "Roboto-Regular.ttf",
        TextRenderOptions{.font_size = 600, .position = DlPoint(10, 500)});
    RenderTextInCanvasSkia(
        GetContext(), builder, "k", "Roboto-Regular.ttf",
        TextRenderOptions{.font_size = 300, .position = DlPoint(10, 800)});
    builder.Restore();
  }
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
>>>>>>> b25305a8832cfc6ba632a7f87ad455e319dccce8
}

// This is a test that looks for glyph artifacts we've see.
TEST_P(AiksTest, MassiveScaleConvertToPath) {
  Scalar scale = 16.0;
  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("Scale", &scale, 4, 20);
      ImGui::End();
    }

    DisplayListBuilder builder;
    DlPaint paint;
    paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
    builder.DrawPaint(paint);

    builder.Scale(scale, scale);
    RenderTextInCanvasSkia(
        GetContext(), builder, "HELLO", "Roboto-Regular.ttf",
        TextRenderOptions{.font_size = 16,
                          .color = (16 * scale >= 250) ? DlColor::kYellow()
                                                       : DlColor::kOrange(),
                          .position = DlPoint(0, 20)});
    return builder.Build();
  };

  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

TEST_P(AiksTest, CanRenderTextFrameWithScalingOverflow) {
  Scalar scale = 60.0;
  Scalar offsetx = -500.0;
  Scalar offsety = 700.0;
  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("scale", &scale, 1.f, 300.f);
      ImGui::SliderFloat("offsetx", &offsetx, -600.f, 100.f);
      ImGui::SliderFloat("offsety", &offsety, 600.f, 2048.f);
      ImGui::End();
    }
    DisplayListBuilder builder;
    builder.Scale(GetContentScale().x, GetContentScale().y);
    DlPaint paint;
    paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
    builder.DrawPaint(paint);
    builder.Scale(scale, scale);

    RenderTextInCanvasSkia(
        GetContext(), builder, "test", "Roboto-Regular.ttf",
        TextRenderOptions{
            .position = DlPoint(offsetx / scale, offsety / scale),
        });
    return builder.Build();
  };
  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

TEST_P(AiksTest, CanRenderTextFrameWithFractionScaling) {
  Scalar fine_scale = 0.f;
  bool is_subpixel = false;
  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("Fine Scale", &fine_scale, -1, 1);
      ImGui::Checkbox("subpixel", &is_subpixel);
      ImGui::End();
    }

    DisplayListBuilder builder;
    DlPaint paint;
    paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
    builder.DrawPaint(paint);
    Scalar scale = 2.625 + fine_scale;
    builder.Scale(scale, scale);
    RenderTextInCanvasSkia(GetContext(), builder,
                           "the quick brown fox jumped over the lazy dog!.?",
                           "Roboto-Regular.ttf",
                           TextRenderOptions{.is_subpixel = is_subpixel});
    return builder.Build();
  };

  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

// https://github.com/flutter/flutter/issues/164958
TEST_P(AiksTest, TextRotated180Degrees) {
  float fpivot[2] = {200 + 30, 200 - 20};
  float rotation = 180;
  float foffset[2] = {200, 200};

  auto callback = [&]() -> sk_sp<DisplayList> {
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("pivotx", &fpivot[0], 0, 300);
      ImGui::SliderFloat("pivoty", &fpivot[1], 0, 300);
      ImGui::SliderFloat("rotation", &rotation, 0, 360);
      ImGui::SliderFloat("foffsetx", &foffset[0], 0, 300);
      ImGui::SliderFloat("foffsety", &foffset[1], 0, 300);
      ImGui::End();
    }
    DisplayListBuilder builder;
    builder.Scale(GetContentScale().x, GetContentScale().y);
    builder.DrawPaint(DlPaint().setColor(DlColor(0xffffeeff)));

    builder.Save();
    DlPoint pivot = Point(fpivot[0], fpivot[1]);
    builder.Translate(pivot.x, pivot.y);
    builder.Rotate(rotation);
    builder.Translate(-pivot.x, -pivot.y);

    RenderTextInCanvasSkia(GetContext(), builder, "test", "Roboto-Regular.ttf",
                           TextRenderOptions{
                               .color = DlColor::kBlack(),
                               .position = DlPoint(foffset[0], foffset[1]),
                           });

    builder.Restore();
    return builder.Build();
  };
  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

TEST_P(AiksTest, TextFrameSubpixelAlignment) {
  // "Random" numbers between 0 and 1. Hardcoded to avoid flakiness in goldens.
  std::array<Scalar, 20> phase_offsets = {
      7.82637e-06, 0.131538,  0.755605,   0.45865,   0.532767,
      0.218959,    0.0470446, 0.678865,   0.679296,  0.934693,
      0.383502,    0.519416,  0.830965,   0.0345721, 0.0534616,
      0.5297,      0.671149,  0.00769819, 0.383416,  0.0668422};
  auto callback = [&]() -> sk_sp<DisplayList> {
    static float font_size = 20;
    static float phase_variation = 0.2;
    static float speed = 0.5;
    static float magnitude = 100;
    if (AiksTest::ImGuiBegin("Controls", nullptr,
                             ImGuiWindowFlags_AlwaysAutoResize)) {
      ImGui::SliderFloat("Font size", &font_size, 5, 50);
      ImGui::SliderFloat("Phase variation", &phase_variation, 0, 1);
      ImGui::SliderFloat("Oscillation speed", &speed, 0, 2);
      ImGui::SliderFloat("Oscillation magnitude", &magnitude, 0, 300);
      ImGui::End();
    }

    DisplayListBuilder builder;
    builder.Scale(GetContentScale().x, GetContentScale().y);

    for (size_t i = 0; i < phase_offsets.size(); i++) {
      DlPoint position = DlPoint(
          200 +
              magnitude * std::sin((-phase_offsets[i] * k2Pi * phase_variation +
                                    GetSecondsElapsed() * speed)),  //
          200 + i * font_size * 1.1                                 //
      );
      if (!RenderTextInCanvasSkia(
              GetContext(), builder,
              "the quick brown fox jumped over "
              "the lazy dog!.?",
              "Roboto-Regular.ttf",
              {.font_size = font_size, .position = position})) {
        return nullptr;
      }
    }
    return builder.Build();
  };

  ASSERT_TRUE(OpenPlaygroundHere(callback));
}

TEST_P(AiksTest, CanRenderItalicizedText) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "HomemadeApple.ttf"));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

static constexpr std::string_view kFontFixture =
#if FML_OS_MACOSX
    "Apple Color Emoji.ttc";
#else
    "NotoColorEmoji.ttf";
#endif

TEST_P(AiksTest, CanRenderEmojiTextFrame) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "😀 😃 😄 😁 😆 😅 😂 🤣 🥲 😊", kFontFixture));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderEmojiTextFrameWithBlur) {
  DisplayListBuilder builder;

  builder.Scale(GetContentScale().x, GetContentScale().y);
  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "😀 😃 😄 😁 😆 😅 😂 🤣 🥲 😊", kFontFixture,
      TextRenderOptions{
          .color = DlColor::kBlue(),
          .filter = DlBlurMaskFilter::Make(DlBlurStyle::kNormal, 4)}));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderEmojiTextFrameWithAlpha) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "😀 😃 😄 😁 😆 😅 😂 🤣 🥲 😊", kFontFixture,
      {.color = DlColor::kBlack().modulateOpacity(0.5)}));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextInSaveLayer) {
  DisplayListBuilder builder;

  DlPaint paint;
  paint.setColor(DlColor::ARGB(0.1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  builder.Translate(100, 100);
  builder.Scale(0.5, 0.5);

  // Blend the layer with the parent pass using kClear to expose the coverage.
  paint.setBlendMode(DlBlendMode::kClear);
  builder.SaveLayer(std::nullopt, &paint);
  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf"));
  builder.Restore();

  // Render the text again over the cleared coverage rect.
  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf"));

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextOutsideBoundaries) {
  DisplayListBuilder builder;
  builder.Translate(200, 150);

  // Construct the text blob.
  auto mapping = flutter::testing::OpenFixtureAsSkData("wtf.otf");
  ASSERT_NE(mapping, nullptr);

  Scalar font_size = 80;
  sk_sp<SkFontMgr> font_mgr = txt::GetDefaultFontManager();
  SkFont sk_font(font_mgr->makeFromData(mapping), font_size);

  DlPaint text_paint;
  text_paint.setColor(DlColor::kBlue().withAlpha(255 * 0.8));

  struct {
    DlPoint position;
    const char* text;
  } text[] = {{DlPoint(0, 0), "0F0F0F0"},
              {DlPoint(1, 2), "789"},
              {DlPoint(1, 3), "456"},
              {DlPoint(1, 4), "123"},
              {DlPoint(0, 6), "0F0F0F0"}};
  for (auto& t : text) {
    builder.Save();
    builder.Translate(t.position.x * font_size * 2,
                      t.position.y * font_size * 1.1);
    {
      auto blob = SkTextBlob::MakeFromString(t.text, sk_font);
      ASSERT_NE(blob, nullptr);
      auto frame = MakeTextFrameFromTextBlobSkia(blob);
      builder.DrawTextFrame(frame, 0, 0, text_paint);
    }
    builder.Restore();
  }

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, TextRotated) {
  DisplayListBuilder builder;

  builder.Scale(GetContentScale().x, GetContentScale().y);
  DlPaint paint;
  paint.setColor(DlColor::ARGB(0.1, 0.1, 0.1, 1.0));
  builder.DrawPaint(paint);

  builder.Transform(Matrix(0.25, -0.3, 0, -0.002,  //
                           0, 0.5, 0, 0,           //
                           0, 0, 0.3, 0,           //
                           100, 100, 0, 1.3));
  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "the quick brown fox jumped over the lazy dog!.?",
      "Roboto-Regular.ttf"));

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, DrawScaledTextWithPerspectiveNoSaveLayer) {
  DisplayListBuilder builder;

  Matrix matrix = Matrix(1.0, 0.0, 0.0, 0.0,    //
                         0.0, 1.0, 0.0, 0.0,    //
                         0.0, 0.0, 1.0, 0.01,   //
                         0.0, 0.0, 0.0, 1.0) *  //
                  Matrix::MakeRotationY({Degrees{10}});

  builder.Transform(matrix);

  ASSERT_TRUE(RenderTextInCanvasSkia(GetContext(), builder, "Hello world",
                                     "Roboto-Regular.ttf"));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, DrawScaledTextWithPerspectiveSaveLayer) {
  DisplayListBuilder builder;

  Matrix matrix = Matrix(1.0, 0.0, 0.0, 0.0,    //
                         0.0, 1.0, 0.0, 0.0,    //
                         0.0, 0.0, 1.0, 0.01,   //
                         0.0, 0.0, 0.0, 1.0) *  //
                  Matrix::MakeRotationY({Degrees{10}});

  DlPaint save_paint;
  DlRect window_bounds =
      DlRect::MakeXYWH(0, 0, GetWindowSize().width, GetWindowSize().height);
  // Note: bounds were not needed by the AIKS version, which may indicate a bug.
  builder.SaveLayer(window_bounds, &save_paint);
  builder.Transform(matrix);

  ASSERT_TRUE(RenderTextInCanvasSkia(GetContext(), builder, "Hello world",
                                     "Roboto-Regular.ttf"));

  builder.Restore();
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextWithLargePerspectiveTransform) {
  // Verifies that text scales are clamped to work around
  // https://github.com/flutter/flutter/issues/136112 .

  DisplayListBuilder builder;

  DlPaint save_paint;
  builder.SaveLayer(std::nullopt, &save_paint);
  builder.Transform(Matrix(2000, 0, 0, 0,   //
                           0, 2000, 0, 0,   //
                           0, 0, -1, 9000,  //
                           0, 0, -1, 7000   //
                           ));

  ASSERT_TRUE(RenderTextInCanvasSkia(GetContext(), builder, "Hello world",
                                     "Roboto-Regular.ttf"));
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, CanRenderTextWithPerspectiveTransformInSublist) {
  DisplayListBuilder text_builder;
  ASSERT_TRUE(RenderTextInCanvasSkia(GetContext(), text_builder, "Hello world",
                                     "Roboto-Regular.ttf"));
  auto text_display_list = text_builder.Build();

  DisplayListBuilder builder;

  Matrix matrix = Matrix::MakeRow(2.0, 0.0, 0.0, 0.0,  //
                                  0.0, 2.0, 0.0, 0.0,  //
                                  0.0, 0.0, 1.0, 0.0,  //
                                  0.0, 0.002, 0.0, 1.0);

  DlPaint save_paint;
  DlRect window_bounds =
      DlRect::MakeXYWH(0, 0, GetWindowSize().width, GetWindowSize().height);
  builder.SaveLayer(window_bounds, &save_paint);
  builder.Transform(matrix);
  builder.DrawDisplayList(text_display_list, 1.0f);
  builder.Restore();

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

// This currently renders solid blue, as the support for text color sources was
// moved into DLDispatching. Path data requires the SkTextBlobs which are not
// used in impeller::TextFrames.
TEST_P(AiksTest, TextForegroundShaderWithTransform) {
  auto mapping = flutter::testing::OpenFixtureAsSkData("Roboto-Regular.ttf");
  ASSERT_NE(mapping, nullptr);

  Scalar font_size = 100;
  sk_sp<SkFontMgr> font_mgr = txt::GetDefaultFontManager();
  SkFont sk_font(font_mgr->makeFromData(mapping), font_size);

  DlPaint text_paint;
  text_paint.setColor(DlColor::kBlue());

  std::vector<DlColor> colors = {DlColor::RGBA(0.9568, 0.2627, 0.2118, 1.0),
                                 DlColor::RGBA(0.1294, 0.5882, 0.9529, 1.0)};
  std::vector<Scalar> stops = {
      0.0,
      1.0,
  };
  text_paint.setColorSource(DlColorSource::MakeLinear(
      /*start_point=*/DlPoint(0, 0),     //
      /*end_point=*/DlPoint(100, 100),   //
      /*stop_count=*/2,                  //
      /*colors=*/colors.data(),          //
      /*stops=*/stops.data(),            //
      /*tile_mode=*/DlTileMode::kRepeat  //
      ));

  DisplayListBuilder builder;
  builder.Translate(100, 100);
  builder.Rotate(45);

  auto blob = SkTextBlob::MakeFromString("Hello", sk_font);
  ASSERT_NE(blob, nullptr);
  auto frame = MakeTextFrameFromTextBlobSkia(blob);
  builder.DrawTextFrame(frame, 0, 0, text_paint);

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

// Regression test for https://github.com/flutter/flutter/issues/157885.
TEST_P(AiksTest, DifferenceClipsMustRenderIdenticallyAcrossBackends) {
  DisplayListBuilder builder;

  DlPaint paint;
  DlColor clear_color(1.0, 0.5, 0.5, 0.5, DlColorSpace::kSRGB);
  paint.setColor(clear_color);
  builder.DrawPaint(paint);

  DlMatrix identity = {
      1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
  };
  builder.Save();
  builder.Transform(identity);

  DlRect frame = DlRect::MakeLTRB(1.0, 1.0, 1278.0, 763.0);
  DlColor white(1.0, 1.0, 1.0, 1.0, DlColorSpace::kSRGB);
  paint.setColor(white);
  builder.DrawRect(frame, paint);

  builder.Save();
  builder.ClipRect(frame, DlClipOp::kIntersect);

  DlMatrix rect_xform = {
      0.8241262, 0.56640625, 0.0, 0.0, -0.56640625, 0.8241262, 0.0, 0.0,
      0.0,       0.0,        1.0, 0.0, 271.1137,    489.4733,  0.0, 1.0,
  };
  builder.Save();
  builder.Transform(rect_xform);

  DlRect rect = DlRect::MakeLTRB(0.0, 0.0, 100.0, 100.0);
  DlColor bluish(1.0, 0.184, 0.501, 0.929, DlColorSpace::kSRGB);
  paint.setColor(bluish);
  DlRoundRect rrect = DlRoundRect::MakeRectRadius(rect, 18.0);
  builder.DrawRoundRect(rrect, paint);

  builder.Save();
  builder.ClipRect(rect, DlClipOp::kIntersect);
  builder.Restore();

  builder.Restore();

  DlMatrix path_xform = {
      1.0, 0.0, 0.0, 0.0, 0.0,   1.0,   0.0, 0.0,
      0.0, 0.0, 1.0, 0.0, 675.0, 279.5, 0.0, 1.0,
  };
  builder.Save();
  builder.Transform(path_xform);

  DlPathBuilder path_builder;
  path_builder.MoveTo(DlPoint(87.5, 349.5));
  path_builder.LineTo(DlPoint(25.0, 29.5));
  path_builder.LineTo(DlPoint(150.0, 118.0));
  path_builder.LineTo(DlPoint(25.0, 118.0));
  path_builder.LineTo(DlPoint(150.0, 29.5));
  path_builder.Close();
  DlPath path(path_builder);

  DlColor fill_color(1.0, 1.0, 0.0, 0.0, DlColorSpace::kSRGB);
  DlColor stroke_color(1.0, 0.0, 0.0, 0.0, DlColorSpace::kSRGB);
  paint.setColor(fill_color);
  paint.setDrawStyle(DlDrawStyle::kFill);
  builder.DrawPath(path, paint);

  paint.setColor(stroke_color);
  paint.setStrokeWidth(2.0);
  paint.setDrawStyle(DlDrawStyle::kStroke);
  builder.DrawPath(path, paint);

  builder.Restore();
  builder.Restore();
  builder.Restore();

  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

TEST_P(AiksTest, TextContentsMismatchedTransformTest) {
  AiksContext aiks_context(GetContext(),
                           std::make_shared<TypographerContextSkia>());

  // Verifies that TextContents only use the scale/transform that is
  // computed during preroll.
  constexpr const char* font_fixture = "Roboto-Regular.ttf";

  // Construct the text blob.
  auto c_font_fixture = std::string(font_fixture);
  auto mapping = flutter::testing::OpenFixtureAsSkData(c_font_fixture.c_str());
  ASSERT_TRUE(mapping);

  sk_sp<SkFontMgr> font_mgr = txt::GetDefaultFontManager();
  SkFont sk_font(font_mgr->makeFromData(mapping), 16);

  auto blob = SkTextBlob::MakeFromString("Hello World", sk_font);
  ASSERT_TRUE(blob);

  auto text_frame = MakeTextFrameFromTextBlobSkia(blob);

  // Simulate recording the text frame during preroll.
  Matrix preroll_matrix =
      Matrix::MakeTranslateScale({1.5, 1.5, 1}, {100, 50, 0});
  Point preroll_point = Point{23, 45};
  {
    auto scale = TextFrame::RoundScaledFontSize(
        (preroll_matrix * Matrix::MakeTranslation(preroll_point))
            .GetMaxBasisLengthXY());

    aiks_context.GetContentContext().GetLazyGlyphAtlas()->AddTextFrame(
        text_frame,     //
        scale,          //
        preroll_point,  //
        preroll_matrix,
        std::nullopt  //
    );
  }

  // Now simulate rendering with a slightly different scale factor.
  RenderTarget render_target =
      aiks_context.GetContentContext()
          .GetRenderTargetCache()
          ->CreateOffscreenMSAA(*aiks_context.GetContext(), {100, 100}, 1);

  TextContents text_contents;
  text_contents.SetTextFrame(text_frame);
  text_contents.SetOffset(preroll_point);
  text_contents.SetScale(1.6);
  text_contents.SetColor(Color::Aqua());

  Matrix not_preroll_matrix =
      Matrix::MakeTranslateScale({1.5, 1.5, 1}, {100, 50, 0});

  Entity entity;
  entity.SetTransform(not_preroll_matrix);

  std::shared_ptr<CommandBuffer> command_buffer =
      aiks_context.GetContext()->CreateCommandBuffer();
  std::shared_ptr<RenderPass> render_pass =
      command_buffer->CreateRenderPass(render_target);

  EXPECT_TRUE(text_contents.Render(aiks_context.GetContentContext(), entity,
                                   *render_pass));
}

<<<<<<< HEAD
=======
TEST_P(AiksTest, TextWithShadowCache) {
  DisplayListBuilder builder;
  builder.Scale(GetContentScale().x, GetContentScale().y);
  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  AiksContext aiks_context(GetContext(),
                           std::make_shared<TypographerContextSkia>());
  // Cache empty
  EXPECT_EQ(aiks_context.GetContentContext()
                .GetTextShadowCache()
                .GetCacheSizeForTesting(),
            0u);

  ASSERT_TRUE(RenderTextInCanvasSkia(
      GetContext(), builder, "Hello World", kFontFixture,
      TextRenderOptions{
          .color = DlColor::kBlue(),
          .filter = DlBlurMaskFilter::Make(DlBlurStyle::kNormal, 4)}));

  DisplayListToTexture(builder.Build(), {400, 400}, aiks_context);

  // Text should be cached.
  EXPECT_EQ(aiks_context.GetContentContext()
                .GetTextShadowCache()
                .GetCacheSizeForTesting(),
            1u);
}

TEST_P(AiksTest, MultipleTextWithShadowCache) {
  DisplayListBuilder builder;
  builder.Scale(GetContentScale().x, GetContentScale().y);
  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  AiksContext aiks_context(GetContext(),
                           std::make_shared<TypographerContextSkia>());
  // Cache empty
  EXPECT_EQ(aiks_context.GetContentContext()
                .GetTextShadowCache()
                .GetCacheSizeForTesting(),
            0u);

  for (auto i = 0; i < 5; i++) {
    ASSERT_TRUE(RenderTextInCanvasSkia(
        GetContext(), builder, "Hello World", kFontFixture,
        TextRenderOptions{
            .color = DlColor::kBlue(),
            .filter = DlBlurMaskFilter::Make(DlBlurStyle::kNormal, 4)}));
  }

  DisplayListToTexture(builder.Build(), {400, 400}, aiks_context);

  // Text should be cached. Each text gets its own entry as we don't analyze the
  // strings.
  EXPECT_EQ(aiks_context.GetContentContext()
                .GetTextShadowCache()
                .GetCacheSizeForTesting(),
            5u);
}

TEST_P(AiksTest, SingleIconShadowTest) {
  DisplayListBuilder builder;
  builder.Scale(GetContentScale().x, GetContentScale().y);
  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);

  AiksContext aiks_context(GetContext(),
                           std::make_shared<TypographerContextSkia>());
  // Cache empty
  EXPECT_EQ(aiks_context.GetContentContext()
                .GetTextShadowCache()
                .GetCacheSizeForTesting(),
            0u);

  // Create font instance outside loop so all draws use identical font instance.
  auto c_font_fixture = std::string(kFontFixture);
  auto mapping = flutter::testing::OpenFixtureAsSkData(c_font_fixture.c_str());
  ASSERT_TRUE(mapping);
  sk_sp<SkFontMgr> font_mgr = txt::GetDefaultFontManager();
  SkFont sk_font(font_mgr->makeFromData(mapping), 50);

  for (auto i = 0; i < 10; i++) {
    ASSERT_TRUE(RenderTextInCanvasSkia(
        GetContext(), builder, "A", kFontFixture,
        TextRenderOptions{
            .color = DlColor::kBlue(),
            .filter = DlBlurMaskFilter::Make(DlBlurStyle::kNormal, 4)},
        sk_font));
  }

  DisplayListToTexture(builder.Build(), {400, 400}, aiks_context);

  // Text should be cached. All 10 glyphs use the same cache entry.
  EXPECT_EQ(aiks_context.GetContentContext()
                .GetTextShadowCache()
                .GetCacheSizeForTesting(),
            1u);
}

TEST_P(AiksTest, VarietyOfTextScalesShowingRasterAndPath) {
  DisplayListBuilder builder;
  DlPaint paint;
  paint.setColor(DlColor::ARGB(1, 0.1, 0.1, 0.1));
  builder.DrawPaint(paint);
  builder.Scale(GetContentScale().x, GetContentScale().y);

  std::vector<Scalar> scales = {4, 8, 16, 24, 32};
  std::vector<Scalar> spacing = {8, 8, 8, 8, 8};
  Scalar space = 16;
  Scalar x = 0;
  for (auto i = 0u; i < scales.size(); i++) {
    builder.Save();
    builder.Scale(scales[i], scales[i]);
    RenderTextInCanvasSkia(
        GetContext(), builder, "lo", "Roboto-Regular.ttf",
        TextRenderOptions{.font_size = 16, .position = DlPoint(x, space)});
    space += spacing[i];
    if (i == 3) {
      x = 10;
      space = 16;
    }
    builder.Restore();
  }
  ASSERT_TRUE(OpenPlaygroundHere(builder.Build()));
}

>>>>>>> b25305a8832cfc6ba632a7f87ad455e319dccce8
}  // namespace testing
}  // namespace impeller
