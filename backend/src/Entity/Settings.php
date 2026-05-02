<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Repository\SettingsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SettingsRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Put(security: "is_granted('ROLE_ADMIN')")
    ]
)]
class Settings
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $primaryColor = '#ffffff';

    #[ORM\Column(length: 255)]
    private ?string $secondaryColor = '#000000';

    #[ORM\Column(length: 255)]
    private ?string $tertiaryColor = '#f3f4f6';

    public function getTertiaryColor(): ?string
    {
        return $this->tertiaryColor;
    }

    public function setTertiaryColor(string $tertiaryColor): static
    {
        $this->tertiaryColor = $tertiaryColor;

        return $this;
    }

    #[ORM\Column]
    private ?int $freeShippingThreshold = null;

    #[ORM\Column]
    private ?float $globalShippingFee = 7.0;

    #[ORM\Column(length: 255)]
    private ?string $siteName = 'Custom Shop';

    #[ORM\Column(type: Types::JSON)]
    private array $availableLocales = ['fr', 'en', 'ar'];

    #[ORM\Column(length: 10)]
    private ?string $defaultLocale = 'fr';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $companyName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $companyAddress = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $companyPhone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $companyEmail = null;

    #[ORM\Column(type: Types::JSON)]
    private array $translations = [];

    #[ORM\Column(length: 255)]
    private ?string $cardColor = null;

    #[ORM\Column(length: 255)]
    private ?string $formBgColor = null;

    #[ORM\Column(length: 255)]
    private ?string $formTextColor = null;

    #[ORM\Column(length: 255)]
    private ?string $headerTextColor = null;

    #[ORM\Column(length: 255)]
    private ?string $footerTextColor = null;

    public function __construct()
    {
        $this->translations = [];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTranslations(): array
    {
        return $this->translations;
    }

    public function setTranslations(array $translations): static
    {
        $this->translations = $translations;

        return $this;
    }

    public function getTranslatedSiteName(string $locale = 'fr'): ?string
    {
        return $this->translations[$locale]['siteName'] ?? $this->siteName;
    }

    public function getTranslatedCompanyName(string $locale = 'fr'): ?string
    {
        return $this->translations[$locale]['companyName'] ?? $this->companyName;
    }

    public function getTranslatedCompanyAddress(string $locale = 'fr'): ?string
    {
        return $this->translations[$locale]['companyAddress'] ?? $this->companyAddress;
    }

    public function getPrimaryColor(): ?string
    {
        return $this->primaryColor;
    }

    public function setPrimaryColor(string $primaryColor): static
    {
        $this->primaryColor = $primaryColor;

        return $this;
    }

    public function getSecondaryColor(): ?string
    {
        return $this->secondaryColor;
    }

    public function setSecondaryColor(string $secondaryColor): static
    {
        $this->secondaryColor = $secondaryColor;

        return $this;
    }

    public function getFreeShippingThreshold(): ?int
    {
        return $this->freeShippingThreshold;
    }

    public function setFreeShippingThreshold(int $freeShippingThreshold): static
    {
        $this->freeShippingThreshold = $freeShippingThreshold;

        return $this;
    }

    public function getGlobalShippingFee(): ?float
    {
        return $this->globalShippingFee;
    }

    public function setGlobalShippingFee(float $globalShippingFee): static
    {
        $this->globalShippingFee = $globalShippingFee;

        return $this;
    }

    public function getSiteName(): ?string
    {
        return $this->siteName;
    }

    public function setSiteName(string $siteName): static
    {
        $this->siteName = $siteName;

        return $this;
    }

    public function getAvailableLocales(): array
    {
        return $this->availableLocales;
    }

    public function setAvailableLocales(array $availableLocales): static
    {
        $this->availableLocales = $availableLocales;

        return $this;
    }

    public function getDefaultLocale(): ?string
    {
        return $this->defaultLocale;
    }

    public function setDefaultLocale(string $defaultLocale): static
    {
        $this->defaultLocale = $defaultLocale;

        return $this;
    }

    public function getCompanyName(): ?string
    {
        return $this->companyName;
    }

    public function setCompanyName(?string $companyName): static
    {
        $this->companyName = $companyName;

        return $this;
    }

    public function getCompanyAddress(): ?string
    {
        return $this->companyAddress;
    }

    public function setCompanyAddress(?string $companyAddress): static
    {
        $this->companyAddress = $companyAddress;

        return $this;
    }

    public function getCompanyPhone(): ?string
    {
        return $this->companyPhone;
    }

    public function setCompanyPhone(?string $companyPhone): static
    {
        $this->companyPhone = $companyPhone;

        return $this;
    }

    public function getCompanyEmail(): ?string
    {
        return $this->companyEmail;
    }

    public function setCompanyEmail(?string $companyEmail): static
    {
        $this->companyEmail = $companyEmail;

        return $this;
    }

    public function getCardColor(): ?string
    {
        return $this->cardColor;
    }

    public function setCardColor(string $cardColor): static
    {
        $this->cardColor = $cardColor;

        return $this;
    }

    public function getFormBgColor(): ?string
    {
        return $this->formBgColor;
    }

    public function setFormBgColor(string $formBgColor): static
    {
        $this->formBgColor = $formBgColor;

        return $this;
    }

    public function getFormTextColor(): ?string
    {
        return $this->formTextColor;
    }

    public function setFormTextColor(string $formTextColor): static
    {
        $this->formTextColor = $formTextColor;

        return $this;
    }

    public function getHeaderTextColor(): ?string
    {
        return $this->headerTextColor;
    }

    public function setHeaderTextColor(string $headerTextColor): static
    {
        $this->headerTextColor = $headerTextColor;

        return $this;
    }

    public function getFooterTextColor(): ?string
    {
        return $this->footerTextColor;
    }

    public function setFooterTextColor(string $footerTextColor): static
    {
        $this->footerTextColor = $footerTextColor;

        return $this;
    }
}
