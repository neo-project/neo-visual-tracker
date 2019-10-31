using System.Numerics;

using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services.Neo;

public class TestContract : SmartContract
{
    public static void Main()
    {
        Storage.Put(Storage.CurrentContext, "Hello", "World");
    }

    public static void Store42() {
        Storage.Put(Storage.CurrentContext, "Number", new BigInteger(42));
    }

    public static void StoreNumber(BigInteger number) {
        Storage.Put(Storage.CurrentContext, "Number", number);
    }

    public static BigInteger GetNumber() {
        return new BigInteger(Storage.Get(Storage.CurrentContext, "Number"));
    }

    public static BigInteger Get42() {
        return new BigInteger(42);
    }

    public static BigInteger Get43() {
        return new BigInteger(43);
    }

    public static void StoreString(string s) {
        Storage.Put(Storage.CurrentContext, "String", s);
    }

    public static object GetString() {
        return Storage.Get(Storage.CurrentContext, "String");
    }
}

