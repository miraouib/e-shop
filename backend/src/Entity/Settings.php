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

    #[ORM\Column]
    private ?int $freeShippingThreshold = null;

    #[ORM\Column(length: 255)]
    private ?string $siteName = 'Custom Shop';

    #[ORM\Column(type: Types::JSON)]
    private array $availableLocales = ['fr', 'en', 'ar'];

    #[ORM\Column(length: 10)]
    private ?string $defaultLocale = 'fr';

    public function getId(): ?int
    {
        return $this->id;
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
}
