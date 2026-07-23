import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-risk.jpg";

const Legal = () => {
  return (
    <div>
      <PageHero
        title="Legal"
        subtitle="Educational content only. Not financial advice. Trading involves risk."
        imageSrc={heroImage}
        imageAlt="Risk planning checklist on a trading desk"
      />

      <div className="container py-12">
        <section className="grid gap-6">
          <Reveal>
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
                <CardDescription>
                  Important information about trading risk.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Trading in financial markets involves significant risk and may
                  result in financial loss.
                </p>

                <p>
                  Epic Trader does not provide financial, investment, legal, or
                  tax advice. All forecasts, market analysis, and educational
                  materials are provided for educational purposes only.
                </p>

                <p>
                  Past performance is not a guarantee of future results. You are
                  solely responsible for your trading and investment decisions.
                </p>

                <p>
                  Epic Trader is not responsible for any financial loss resulting
                  from the use of this website or its content.
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  How we handle your personal information.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  We respect your privacy and are committed to protecting your
                  personal information.
                </p>

                <p>
                  We collect only the information necessary to provide our
                  services, manage user accounts, improve your experience, and
                  maintain platform security.
                </p>

                <p>
                  Your personal information is not sold to third parties. Some
                  information may be processed by trusted service providers that
                  support the operation of Epic Trader.
                </p>

                <p>
                  By using Epic Trader, you agree to the collection and use of
                  your information in accordance with this Privacy Policy.
                </p>

                <p>
                  For privacy-related questions, contact us at{" "}
                  <a
                    href="mailto:epictrader.support@gmail.com"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    epictrader.support@gmail.com
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={200}>
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Terms of Use</CardTitle>
                <CardDescription>
                  Rules for using the Epic Trader platform.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  By accessing or using Epic Trader, you agree to these Terms of
                  Use.
                </p>

                <p>
                  Epic Trader is an educational platform and does not provide
                  financial advice. You are responsible for your own trading and
                  investment decisions.
                </p>

                <p>
                  You agree to use the platform lawfully and responsibly and not
                  to interfere with its security, operation, or other users.
                </p>

                <p>
                  All content, branding, graphics, and educational materials on
                  this website belong to Epic Trader and may not be copied or
                  redistributed without permission.
                </p>

                <p>
                  We may update these terms or suspend accounts that violate our
                  policies. Continued use of the website means you accept the
                  latest version of these Terms of Use.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default Legal;
